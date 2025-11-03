import { NextRequest, NextResponse } from "next/server";
import { signMintAuth } from "@/lib/eip712";
import { checkMintRateLimit } from "@/lib/rate-limit";
import { db, tokens } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { env } from "@/env.mjs";
import { ethers } from "ethers";
import type { MintPermitRequest, MintAuth } from "@/lib/types";
import { supabase, isSupabaseAvailable } from "@/lib/supabase";

// Contract ABI for querying nonce
const CONTRACT_ABI = [
  "function getNonce(address user) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "function MAX_SUPPLY() external view returns (uint256)",
  "function usedXUserId(uint256) external view returns (bool)",
];

export async function POST(request: NextRequest) {
  try {
    const body: MintPermitRequest = await request.json();
    const { wallet } = body;
    
    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet address" }, { status: 400 });
    }
    
    // Validate wallet address
    if (!ethers.isAddress(wallet)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }
    
    // Convert wallet address to uint256 (hash the address to get a unique uint256)
    // Use lowercase wallet address for consistency
    const walletLower = wallet.toLowerCase();
    const hash = ethers.id(walletLower); // keccak256 hash (returns 0x prefix)
    const walletAddressBigInt = BigInt(hash); // Convert to BigInt for uint256
    console.log(`Converting wallet "${walletLower}" to uint256: ${hash}`);
    
    // Rate limiting
    const allowed = await checkMintRateLimit(wallet);
    if (!allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    
    // x402 payment verification is handled by middleware
    // If we reach here, payment has been verified by x402-next middleware
    // Get payment info from X-PAYMENT header (set by middleware after verification)
    const paymentHeader = request.headers.get("X-PAYMENT");
    let paymentVerification: any = null;
    
    if (paymentHeader) {
      try {
        const paymentData = JSON.parse(paymentHeader);
        paymentVerification = {
          payer: paymentData.payer || wallet,
          amount: paymentData.amount || env.X402_PRICE_USDC,
          asset: paymentData.asset || "USDC",
          network: paymentData.network || "base",
          recipient: paymentData.recipient || env.X402_RECEIVER_WALLET || wallet,
        };
        console.log("✅ Payment verified by x402 middleware:", paymentVerification);
      } catch (error) {
        console.warn("Failed to parse payment header, using wallet as payer:", error);
        // Fallback for development
        paymentVerification = {
          payer: wallet,
          amount: env.X402_PRICE_USDC,
          asset: "USDC",
          network: "base",
          recipient: env.X402_RECEIVER_WALLET || wallet,
        };
      }
    } else {
      // This shouldn't happen if middleware is working correctly
      // But for development/testing, allow it
      console.warn("⚠️ No X-PAYMENT header found - allowing request (development mode)");
      paymentVerification = {
        payer: wallet,
        amount: env.X402_PRICE_USDC,
        asset: "USDC",
        network: "base",
        recipient: env.X402_RECEIVER_WALLET || wallet,
      };
    }
    
    // Check contract: if user already minted
    if (!env.RPC_URL || !env.CONTRACT_ADDRESS) {
      return NextResponse.json({ error: "RPC_URL or CONTRACT_ADDRESS not configured" }, { status: 500 });
    }
    const provider = new ethers.JsonRpcProvider(env.RPC_URL);
    const contract = new ethers.Contract(env.CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    try {
      const alreadyMinted = await contract.usedXUserId(walletAddressBigInt);
      if (alreadyMinted) {
        return NextResponse.json({ error: "Wallet already minted" }, { status: 400 });
      }
      
      // Check supply
      const totalSupply = await contract.totalSupply();
      const maxSupply = await contract.MAX_SUPPLY();
      if (totalSupply >= maxSupply) {
        return NextResponse.json({ error: "Max supply reached" }, { status: 400 });
      }
      
      // Get nonce from contract
      const nonce = await contract.getNonce(wallet);
      
      // Get token URI from database (from generate step)
      console.log(`Looking for token with wallet: ${walletLower}`);
      let tokenURI: string;
      
      // Use Supabase if available (preferred), fallback to Drizzle
      if (isSupabaseAvailable() && supabase) {
        const { data: tokenData, error: supabaseError } = await supabase
          .from("tokens")
          .select("token_uri")
          .eq("x_user_id", walletLower)
          .limit(1)
          .maybeSingle();
        
        if (supabaseError) {
          console.error("Supabase query error:", supabaseError);
          return NextResponse.json({ error: "Failed to query token data" }, { status: 500 });
        }
        
        if (!tokenData) {
          return NextResponse.json({ error: "Token not generated. Please generate first." }, { status: 400 });
        }
        
        tokenURI = tokenData.token_uri;
        console.log(`Found token for wallet: ${walletLower} (via Supabase)`);
      } else {
        // Fallback to Drizzle ORM
        const tokenData = await db
          .select()
          .from(tokens)
          .where(eq(tokens.x_user_id, walletLower))
          .limit(1);
        
        console.log(`Found ${tokenData.length} tokens for wallet: ${walletLower} (via Drizzle)`);
        
        if (!tokenData || tokenData.length === 0) {
          return NextResponse.json({ error: "Token not generated. Please generate first." }, { status: 400 });
        }
        
        tokenURI = tokenData[0].token_uri;
      }
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
    
      const auth: MintAuth = {
        to: wallet,
        payer: paymentVerification.payer,
        walletAddress: walletLower, // Use wallet address
        tokenURI,
        nonce: Number(nonce),
        deadline,
      };
      
      // Sign mint auth
      const signature = await signMintAuth(auth);
      
      return NextResponse.json({
        auth,
        signature,
      });
    } catch (error) {
      console.error("Contract query error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to query contract" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Mint permit error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Mint permit failed" },
      { status: 500 }
    );
  }
}

