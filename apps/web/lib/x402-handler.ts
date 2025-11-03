import { NextRequest, NextResponse } from "next/server";
import { env } from "../env.mjs";

/**
 * x402 Payment Handler for Next.js Route Handlers
 * Based on x402 protocol specification
 * 
 * This handles payment verification and returns 402 Payment Required
 * when payment is not present or invalid.
 */

export interface X402PaymentRequest {
  x402Version: number;
  accepts: Array<{
    asset: string;
    amount: string;
    network: string;
    recipient: string;
  }>;
  error?: string;
}

/**
 * Create x402 payment required response
 * Returns 402 status with payment instructions
 */
export function createX402PaymentResponse(receivingWallet: string): X402PaymentRequest {
  const network = env.NEXT_PUBLIC_CHAIN_ID === "8453" ? "base" : "base-sepolia";
  const amount = "6000000"; // 6 USDC (6 decimals)
  
  return {
    x402Version: 1,
    accepts: [
      {
        asset: "USDC",
        amount,
        network,
        recipient: receivingWallet,
      },
    ],
    error: "",
  };
}

/**
 * Verify x402 payment from X-PAYMENT header
 * Returns payment verification data if valid, null otherwise
 */
export async function verifyX402PaymentHeader(
  paymentHeader: string | null,
  facilitatorUrl?: string
): Promise<{ payer: string; amount: string; asset: string; network: string; recipient: string } | null> {
  if (!paymentHeader) {
    return null;
  }

  try {
    const paymentData = JSON.parse(paymentHeader);
    
    // If facilitator URL is provided, verify with facilitator
    if (facilitatorUrl) {
      const response = await fetch(`${facilitatorUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment: paymentData }),
      });
      
      if (!response.ok) {
        console.error("Facilitator verification failed:", response.status);
        return null;
      }
      
      const verification = await response.json();
      return {
        payer: verification.payer,
        amount: verification.amount,
        asset: verification.asset || "USDC",
        network: verification.network || "base",
        recipient: verification.recipient,
      };
    }
    
    // Basic verification (for testnet or development)
    if (paymentData.payer && paymentData.amount && paymentData.asset) {
      return {
        payer: paymentData.payer,
        amount: paymentData.amount,
        asset: paymentData.asset,
        network: paymentData.network || "base",
        recipient: paymentData.recipient,
      };
    }
    
    return null;
  } catch (error) {
    console.error("x402 payment verification error:", error);
    return null;
  }
}

/**
 * Handle x402 payment flow in route handler
 * Returns 402 if payment required, or null if payment is valid
 */
export async function handleX402Payment(
  request: NextRequest,
  receivingWallet: string
): Promise<NextResponse | null> {
  const paymentHeader = request.headers.get("X-PAYMENT");
  
  // If no payment header, return 402 Payment Required
  if (!paymentHeader) {
    const paymentResponse = createX402PaymentResponse(receivingWallet);
    return NextResponse.json(paymentResponse, { status: 402 });
  }
  
  // Verify payment
  const facilitatorUrl = env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
  const verification = await verifyX402PaymentHeader(paymentHeader, facilitatorUrl);
  
  if (!verification) {
    const paymentResponse = createX402PaymentResponse(receivingWallet);
    return NextResponse.json(paymentResponse, { status: 402 });
  }
  
  // Payment is valid - return null to continue
  return null;
}

