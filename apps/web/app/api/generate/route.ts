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
      const walletLower = walletAddress.toLowerCase();
      
      // CRITICAL: Check if wallet already has an NFT generated
      // This prevents duplicate generation and saves costs
      try {
        const existingToken = await db
          .select()
          .from(tokens)
          .where(eq(tokens.x_user_id, walletLower))
          .limit(1);
        
        if (existingToken.length > 0 && existingToken[0].image_uri) {
          console.log(`✅ Found existing NFT for wallet: ${walletLower}`);
          
          // Return existing NFT without generating a new one
          // This saves money on AI image generation
          const existing = existingToken[0];
          
          // Fetch image from IPFS for preview (if needed)
          let previewDataUrl = "";
          try {
            if (existing.image_uri && !existing.image_uri.startsWith("ipfs://mock_")) {
              const imageUrl = existing.image_uri.replace("ipfs://", "https://ipfs.io/ipfs/");
              // For preview, we'll use the IPFS URL directly
              // Client can handle it, or we could fetch and convert to base64
              previewDataUrl = imageUrl;
            }
          } catch (previewError) {
            console.warn("Failed to prepare preview for existing NFT:", previewError);
          }
          
          return NextResponse.json({
            seed: existing.seed,
            traits: existing.traits as any,
            imageUrl: existing.image_uri,
            metadataUrl: existing.metadata_uri,
            preview: previewDataUrl,
            existing: true, // Flag to indicate this is an existing NFT
          });
        }
      } catch (dbCheckError) {
        console.warn("Database check failed, proceeding with generation:", dbCheckError);
        // Continue with generation if database check fails
      }
      
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
      
      // Save to database - CRITICAL for preventing duplicate generation
      try {
        // Check again before insert (race condition protection)
        const existingCheck = await db
          .select()
          .from(tokens)
          .where(eq(tokens.x_user_id, walletLower))
          .limit(1);
        
        if (existingCheck.length === 0) {
          // Token doesn't exist, save generation data
          console.log(`💾 Saving new NFT generation for wallet: ${walletLower}`);
          await db.insert(tokens).values({
            x_user_id: walletLower, // Store wallet address in x_user_id field
            token_id: 0, // Will be updated after mint
            seed,
            token_uri: metadataUrl,
            metadata_uri: metadataUrl,
            image_uri: imageUrl,
            traits: traits as any,
          });
          console.log(`✅ NFT saved to database for wallet: ${walletLower}`);
        } else {
          console.warn(`⚠️ NFT already exists for wallet ${walletLower}, but we generated anyway. This should not happen.`);
        }
      } catch (dbError) {
        // Database save failed - this is critical for preventing duplicates
        console.error("❌ CRITICAL: Failed to save token to database:", dbError);
        console.error("💡 This means the wallet could generate multiple NFTs, costing money!");
        // Still return the image, but log the error
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

