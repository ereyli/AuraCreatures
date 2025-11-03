import { NextRequest, NextResponse } from "next/server";
import { generateSeed, seedToTraits } from "@/lib/traits";
import { generateImage } from "@/lib/ai";
import { pinToIPFS, pinJSONToIPFS } from "@/lib/ipfs";
import { checkGenerateRateLimit } from "@/lib/rate-limit";
import { acquireLock, releaseLock } from "@/lib/kv";
import { db, tokens } from "@/lib/db";
import { eq } from "drizzle-orm";
import { env } from "@/env.mjs";
import type { GenerateRequest, GenerateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { walletAddress } = body;
    
    if (!walletAddress) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }
    
    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ error: "Invalid wallet address format" }, { status: 400 });
    }
    
    // Rate limiting (OPTIONAL - fail-open if KV unavailable)
    // Purpose: Prevent abuse (too many requests per hour)
    // Note: If KV/database is unavailable, we allow the request to proceed
    try {
      const allowed = await checkGenerateRateLimit(walletAddress);
      if (!allowed) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
      }
    } catch (rateLimitError) {
      console.warn("⚠️ Rate limit check failed, allowing request (fail-open):", rateLimitError);
      // Continue without rate limiting if KV is unavailable
    }
    
    // Acquire lock to prevent duplicate generation (fail-open if KV unavailable)
    const lockKey = `generate:${walletAddress.toLowerCase()}`;
    let lockAcquired = false;
    try {
      lockAcquired = await acquireLock(lockKey);
      if (!lockAcquired) {
        console.warn("Lock already exists, but continuing (KV may be unavailable)");
      }
    } catch (lockError) {
      console.warn("Failed to acquire lock, continuing anyway (fail-open):", lockError);
      lockAcquired = true; // Assume lock acquired to allow generation
    }
    
    try {
      // Generate deterministic traits from wallet address
      const seed = generateSeed(walletAddress);
      const traits = seedToTraits(seed);
      
      // Generate AI image using deterministic traits
      // Uses real Daydreams API - requires Daydreams account to have sufficient balance
      let imageBuffer: Buffer;
      try {
        imageBuffer = await generateImage(
          traits,
          seed,
          env.COLLECTION_THEME
        );
      } catch (imageError: any) {
        // Handle payment required error
        if (imageError.paymentRequired || imageError.message?.includes("PAYMENT_REQUIRED")) {
          return NextResponse.json(
            {
              error: "Daydreams account balance insufficient",
              code: "PAYMENT_REQUIRED",
              message: "Your Daydreams account needs sufficient balance for image generation. Please add funds to your Daydreams account at https://daydreams.systems",
              details: imageError.paymentDetails || {},
              requiresDaydreamsBalance: true,
            },
            { status: 402 }
          );
        }
        // Re-throw other errors
        throw imageError;
      }
      
      // Convert image buffer to base64 for preview
      const imageBase64 = imageBuffer.toString("base64");
      const previewDataUrl = `data:image/png;base64,${imageBase64}`;
      
      // Pin image to IPFS
      const imageUrl = await pinToIPFS(imageBuffer, `${walletAddress.toLowerCase()}.png`);
      
      // Create metadata
      const metadata = {
        name: `Aura Creature #${walletAddress.substring(0, 8)}`,
        description: `AI-generated Aura Creature NFT for wallet ${walletAddress}`,
        image: imageUrl,
        attributes: Object.entries(traits).map(([trait_type, value]) => ({
          trait_type,
          value,
        })),
        seed,
        theme: env.COLLECTION_THEME,
        version: env.MODEL_VERSION,
      };
      
      // Pin metadata to IPFS
      const metadataUrl = await pinJSONToIPFS(metadata);
      
      // Save to database (OPTIONAL - for tracking/preventing duplicates)
      // If database is unavailable, we still return the generated image
      try {
        // Use wallet address as identifier (convert to lowercase for consistency)
        const walletLower = walletAddress.toLowerCase();
        const existingToken = await db
          .select()
          .from(tokens)
          .where(eq(tokens.x_user_id, walletLower)) // Using x_user_id field to store wallet address
          .limit(1);
        
        console.log(`Checking for existing token with wallet: ${walletLower}`, existingToken.length);
        
        if (existingToken.length === 0) {
          // Token not minted yet, save generation data
          console.log(`Inserting token for wallet: ${walletLower}`);
          const insertResult = await db.insert(tokens).values({
            x_user_id: walletLower, // Store wallet address in x_user_id field for now
            token_id: 0, // Will be updated after mint
            seed,
            token_uri: metadataUrl,
            metadata_uri: metadataUrl,
            image_uri: imageUrl,
            traits: traits as any,
          });
          console.log("Insert result:", insertResult);
          
          // Verify insert worked
          const verifyToken = await db
            .select()
            .from(tokens)
            .where(eq(tokens.x_user_id, walletLower))
            .limit(1);
          console.log(`Verification: ${verifyToken.length} tokens found after insert`);
        }
      } catch (dbError) {
        // Database save failed - this is non-critical
        // Image is already generated and pinned to IPFS
        console.warn("⚠️ Failed to save token to database (non-critical):", dbError);
        console.warn("💡 Image generation succeeded - database save is optional");
      }
      
      const response: GenerateResponse = {
        seed,
        traits,
        imageUrl,
        metadataUrl,
        preview: previewDataUrl, // Base64 preview for immediate display
      };
      
      return NextResponse.json(response);
    } finally {
      // Release lock (ignore errors - KV may be unavailable)
      try {
        await releaseLock(lockKey);
      } catch (releaseError) {
        console.warn("Failed to release lock (non-critical):", releaseError);
      }
    }
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}

