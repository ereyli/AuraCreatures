import { paymentMiddleware, Network } from 'x402-next';
import { env } from './env.mjs';

// Get facilitator configuration
// Testnet: use x402.org facilitator
// Mainnet: use CDP facilitator (requires @coinbase/x402 package and CDP_API_KEY_ID, CDP_API_KEY_SECRET)
function getFacilitator() {
  // Check if we have CDP API keys (mainnet)
  if (env.CDP_API_KEY_ID && env.CDP_API_KEY_SECRET) {
    // For mainnet, import and use CDP facilitator
    // Dynamic import to avoid build errors if package is not available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { facilitator } = require("@coinbase/x402");
      return facilitator;
    } catch (error) {
      console.warn("CDP facilitator not available, falling back to testnet:", error);
      return { url: env.X402_FACILITATOR_URL || "https://x402.org/facilitator" };
    }
  }
  
  // Fallback to testnet facilitator
  return { url: env.X402_FACILITATOR_URL || "https://x402.org/facilitator" };
}

// Configure the payment middleware for mint-permit route
export const middleware = paymentMiddleware(
  env.X402_RECEIVER_WALLET || "0x0000000000000000000000000000000000000000", // Receiving wallet address
  {
    "POST /api/mint-permit": {
      price: "$6.00", // 6 USDC
      network: env.NEXT_PUBLIC_CHAIN_ID === "8453" ? "base" : "base-sepolia", // base for mainnet, base-sepolia for testnet
      config: {
        description: "Mint your Aura Creature NFT - Payment required to mint your unique NFT",
        inputSchema: {
          type: "object",
          properties: {
            wallet: {
              type: "string",
              description: "Wallet address to mint the NFT to"
            }
          },
          required: ["wallet"]
        },
        outputSchema: {
          type: "object",
          properties: {
            auth: {
              type: "object",
              description: "Mint authorization data"
            },
            signature: {
              type: "string",
              description: "Server signature for mint permit"
            }
          }
        }
      }
    },
  },
  getFacilitator()
);

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/mint-permit',
  ]
};

