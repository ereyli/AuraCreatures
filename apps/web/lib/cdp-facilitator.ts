/**
 * CDP Facilitator Setup for x402 Mainnet
 * Based on: https://docs.cdp.coinbase.com/x402/quickstart-for-sellers
 * 
 * Note: CDP facilitator uses environment variables (CDP_API_KEY_ID, CDP_API_KEY_SECRET)
 * and authenticates via HTTP Basic Auth when making requests to the facilitator API.
 */

import { env } from "../env.mjs";

/**
 * Get facilitator configuration
 * Returns CDP facilitator URL for mainnet, or testnet URL for testnet
 */
export function getFacilitator(): { url: string; auth?: { username: string; password: string } } {
  // Check if we have CDP API keys (mainnet)
  if (env.CDP_API_KEY_ID && env.CDP_API_KEY_SECRET) {
    // CDP facilitator URL (mainnet)
    // The facilitator will authenticate using CDP_API_KEY_ID and CDP_API_KEY_SECRET
    // These are passed as HTTP Basic Auth headers when making requests
    return {
      url: "https://api.cdp.coinbase.com/x402/facilitator", // CDP facilitator endpoint
      auth: {
        username: env.CDP_API_KEY_ID,
        password: env.CDP_API_KEY_SECRET,
      },
    };
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
