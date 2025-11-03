/**
 * CDP Facilitator Setup for x402 Mainnet
 * Based on: https://docs.cdp.coinbase.com/x402/quickstart-for-sellers
 */

import { facilitator } from "@coinbase/x402";
import { env } from "../env.mjs";

/**
 * Get facilitator configuration
 * Returns CDP facilitator for mainnet, or testnet URL for testnet
 */
export function getFacilitator() {
  // Check if we have CDP API keys (mainnet)
  if (env.CDP_API_KEY_ID && env.CDP_API_KEY_SECRET) {
    // CDP facilitator will use environment variables:
    // CDP_API_KEY_ID and CDP_API_KEY_SECRET
    return facilitator;
  }
  
  // Fallback to testnet facilitator
  return {
    url: env.X402_FACILITATOR_URL || "https://x402.org/facilitator",
  };
}

/**
 * Check if using CDP facilitator (mainnet)
 */
export function isUsingCDPFacilitator(): boolean {
  return !!(env.CDP_API_KEY_ID && env.CDP_API_KEY_SECRET);
}

