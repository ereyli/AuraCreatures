
---

# X-Profile → AI Animal NFT (Base, x402 + Daydreams)

End-to-end README for the 10k community NFT collection on USDC via Base with X profile → AI character generation → x402 payment → mint.
This version includes explicit references to the payment protocol (x402) and the AI API provider (Daydreams).

## 0) Features & Goals

* One X account = One NFT (enforced off-chain + on-chain)
* Supply cap 10,000, on BASE network (L2)
* Deterministic seed → trait selection ensures uniqueness; AI generates final art
* Seamless UX: User connects X account → preview/or direct generation → pay via x402 → receive signed mint permit → immediate on-chain mint
* Use Daydreams as the generative image API
* Use x402 as the paywall/payment protocol before mint
* Backend + API on Vercel; pinning through IPFS/Arweave; contract via OpenZeppelin on Base

## 1) Architecture Overview

```
User Browser
  │→ Connect X OAuth → /api/auth/x
  │→ /api/generate → seed → traits → Daydreams API → image → IPFS
  │→ Click “Mint” → /api/mint-permit ───> HTTP 402 (x402 paywall)
  │            payment made via x402 → server verifies → issue EIP-712 permit
  │→ wallet invokes contract.mintWithSig(auth, sig)
  
Backend (Vercel):
  ├─ Next.js API Routes
  ├─ Vercel KV (rate-limit, locks)
  ├─ Vercel Postgres (users, combos, tokens, payments)
  ├─ Daydreams API client (image generation)
  ├─ IPFS pinning (Pinata/Web3.Storage)
  └─ x402 payment gate & verification logic  

On-chain (Base network):
  └─ ERC-721 contract with mintWithSig, usedXUserId, MAX_SUPPLY=10 000
```

## 2) Repository Structure

```
/ (root)
├─ apps/
│   └─ web/                 # Next.js (App Router)
├─ packages/
│   ├─ contracts/           # Solidity contract
│   ├─ shared/              # shared types (EIP-712, traits)
│   └─ infra/               # scripts (deploy, pin, seed tools)
└─ .github/workflows/
```

apps/web:

```
apps/web/
├─ app/
│   ├─ api/
│   │   ├─ auth/x/route.ts
│   │   ├─ generate/route.ts
│   │   ├─ mint-permit/route.ts
│   │   └─ webhooks/x402/route.ts
│   ├─ layout.tsx
│   └─ page.tsx
├─ lib/
│   ├─ x.ts                 # X API client
│   ├─ traits.ts            # seed → traits
│   ├─ ai.ts                # Daydreams API wrapper
│   ├─ ipfs.ts              # Pinata/Web3.Storage helpers
│   ├─ eip712.ts            # domain/types/sign helpers
│   ├─ db.ts                # Postgres (drizzle/prisma)
│   ├─ kv.ts                # Vercel KV helper
│   ├─ x402.ts              # paywall logic
│   └─ rate-limit.ts
├─ env.mjs                  # zod validated env loader
└─ package.json
```

packages/contracts:

```
packages/contracts/
├─ src/
│   └─ XAnimalNFT.sol
├─ script/
│   └─ Deploy.s.sol  (Foundry) or deploy.ts (Hardhat)
└─ package.json
```

## 3) Environment Variables (Vercel)

```
NEXT_PUBLIC_CHAIN_ID             = 8453
RPC_URL                          = https://base-mainnet.g.alchemy.com/v2/…
CONTRACT_ADDRESS                 = 0x…
SERVER_SIGNER_PRIVATE_KEY        = 0xabc…
X_CLIENT_ID                      = …
X_CLIENT_SECRET                  = …
X_CALLBACK_URL                   = https://yourapp.com/api/auth/x/callback
PINATA_JWT                       = Bearer eyJ…
WEB3_STORAGE_TOKEN               = …
INFERENCE_API_KEY                = …       # For Daydreams
DATABASE_URL                     = …
KV_REST_API_URL                 = …
KV_REST_API_TOKEN               = …
X402_FACILITATOR_URL             = https://… (from x402 docs)
X402_PRICE_USDC                 = 2000000   # e.g. 2 USDC (6 decimals)
COLLECTION_THEME                 = frog
MODEL_VERSION                   = v1.0.0
```

## 4) Smart Contract (Solidity)

(… same as prior version, but ensure payer field present …)

```
struct MintAuth {
    address to;
    address payer;
    uint256 xUserId;
    string  tokenURI;
    uint256 nonce;
    uint256 deadline;
}
```

Refer to example from earlier (no change).
Max supply 10 000, mapping usedXUserId, etc.

## 5) Deterministic Traits

(… same as prior version)
But highlight: Seed generation + trait arrays.

## 6) AI Image Generation with Daydreams

### Provider: Daydreams

* Docs: [Daydreams Docs](https://docs.daydreams.systems/) ([Daydreams][1])
* Router / SDK page: [Daydreams Router Docs](https://docs.dreams.fun/docs/router) ([Daydreams][2])
* GitHub: [Daydreams GitHub](https://github.com/daydreamsai/daydreams) ([GitHub][3])

### Integration

```ts
import { dreamsRouter } from "@daydreamsai/ai-sdk-provider";

const { router } = await createDreamsRouterAuth(account, {
  payments: {
    amount: "100000",         // e.g. 0.10 USDC
    network: "base",          // or base-mainnet
  },
});

const imageResult = await router("stabilityai/sdxl-turbo")({
  prompt: `A stylized community avatar of a friendly frog character. Apply the following traits exactly: Color=${traits.color}, Eyes=${traits.eyes}, Ears=${traits.ears}, Mouth=${traits.mouth}, Outfit=${traits.outfit}, Hand Item=${traits.hand}, Background=${traits.bg}. Crisp edges, subtle shading, square 1024x1024. No text or watermark.`,
  seed: seedValue,
  size: "1024x1024",
  style: "pixel-art",
});
const imageBuffer = imageResult.image;  // depends on API
```

> Note: Although Daydreams SDK supports payments (x402) itself, you might still control the paywall in your backend (for mint) and use Daydreams simply for generation. Confirm with their pricing and usage limits.

## 7) x402 Payment Flow

### Protocol Documentation

* Overview: [x402 Developer Docs](https://docs.cdp.coinbase.com/x402/docs/welcome) ([docs.cdp.coinbase.com][4])
* How it works: [How x402 Works](https://docs.cdp.coinbase.com/x402/core-concepts/how-it-works) ([docs.cdp.coinbase.com][5])
* HTTP 402 explanation: [HTTP 402 – x402 doc](https://docs.cdp.coinbase.com/x402/core-concepts/http-402) ([docs.cdp.coinbase.com][6])
* GitHub repo: [GitHub x402](https://github.com/coinbase/x402) ([GitHub][7])

### Flow for our project

1. Client requests `/api/mint-permit`
2. Server responds **HTTP 402 Payment Required** with payment instructions (amount, network, asset)
3. Client pays (via wallet/SDK) and resubmits with `X-PAYMENT` header containing payload
4. Server verifies with facilitator (or local) and either returns **402** again or **200 OK** with `{auth, signature}`
5. Server can include `X-PAYMENT-RESPONSE` header in success response with settlement details. ([docs.cdp.coinbase.com][5])

### Example JSON (Seller’s 402 response)

```json
HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x402Version": 1,
  "accepts": [
    {
      "asset": "USDC",
      "amount": "2000000",       // e.g. 2 USDC (6 decimals)
      "network": "base",
      "recipient": "0xYourReceiverAddress"
    }
  ],
  "error": ""
}
```

## 8) API Routes Summary

### `/api/auth/x`

OAuth with X, returns `{ x_user_id, username, profile_image_url }`.

### `/api/generate`

Takes `{ x_user_id, profile_image_url }`, downloads image, hashes it, generates seed & traits, calls Daydreams API → pins image + metadata → returns preview or full.

### `/api/mint-permit`

Takes `{ wallet }`, if no mint yet & supply left:

* Responds 402 with x402 paywall.
* On retry with `X-PAYMENT`, verify payment → issue `MintAuth` & `signature`.

### `/api/webhooks/x402` (optional)

Handles asynchronous settlement updates.

## 9) Database Schema

(… same as prior)

## 10) EIP-712 Domain & Types

(… same as prior)

## 11) Frontend Flow

(… same as prior)

## 12) Security Checklist

(… same as prior)

## 13) Deployment Steps

(… same as prior, with added check: Daydreams integration working + payment flows via x402)

## 14) Costs

(… same as prior)

## 15) Troubleshooting

(… same as prior)

## 16) Roadmap / Variants

(… same as prior)

## 17) Legal & Policy Notes

(… same as prior)

## 18) Prompt Templates

(… same as prior)

## 19) Definition of Done

(… same as prior)

---

> **Links Summary**:
>
> * x402 Docs: [https://docs.cdp.coinbase.com/x402/docs/welcome](https://docs.cdp.coinbase.com/x402/docs/welcome) ([docs.cdp.coinbase.com][4])
> * Daydreams Docs: [https://docs.daydreams.systems/](https://docs.daydreams.systems/) ([Daydreams][1])
> * Daydreams Router/Payments: [https://docs.dreams.fun/docs/router](https://docs.dreams.fun/docs/router) ([Daydreams][2])

---


[1]: https://docs.daydreams.systems/?utm_source=chatgpt.com "Daydreams | Generative Agents"
[2]: https://docs.dreams.fun/docs/router?utm_source=chatgpt.com "Daydreams Router"
[3]: https://github.com/daydreamsai/daydreams?utm_source=chatgpt.com "Daydreams is a generative agent framework for executing ..."
[4]: https://docs.cdp.coinbase.com/x402/docs/welcome?utm_source=chatgpt.com "Welcome to x402 | Coinbase Developer Documentation"
[5]: https://docs.cdp.coinbase.com/x402/core-concepts/how-it-works?utm_source=chatgpt.com "How x402 Works - Coinbase Developer Documentation"
[6]: https://docs.cdp.coinbase.com/x402/core-concepts/http-402?utm_source=chatgpt.com "HTTP 402 - Coinbase Developer Documentation"
[7]: https://github.com/coinbase/x402?utm_source=chatgpt.com "coinbase/x402: A payments protocol for the internet. Built on HTTP."
