# 🎨 Aura Creatures NFT - Community Collection on Base

> AI-generated 10,000 NFT collection powered by X profiles, Daydreams AI, and x402 payments

## ✨ Features

- 🐦 **X Integration**: Connect your X (Twitter) profile to generate your unique NFT
- 🤖 **AI Generation**: Powered by Daydreams AI for hyper-realistic creature portraits
- 💰 **x402 Payments**: Decentralized USDC payments for minting
- 🏛️ **Base Network**: Deployed on Base Sepolia testnet
- 📦 **IPFS Storage**: Decentralized image and metadata storage
- ⚡ **Instant Preview**: See your NFT before minting

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  Next.js 14 + React + Tailwind
└──────┬──────┘
       │
       ├─→ API Routes
       │   ├─ /api/auth/x         X OAuth
       │   ├─ /api/generate       AI Image Generation
       │   ├─ /api/mint-permit    EIP-712 Signing
       │   └─ /api/webhook/x402   Payment Webhooks
       │
       ├─→ Blockchain
       │   └─ Base Sepolia (ERC-721)
       │
       └─→ External Services
           ├─ Daydreams AI        Image generation
           ├─ x402 Protocol       Payments
           ├─ Pinata/IPFS         Storage
           ├─ Vercel Postgres     Database
           └─ Vercel KV           Rate limiting
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account
- Daydreams API key
- Pinata or Web3.Storage token
- X Developer account

### Installation

1. Clone the repository:
```bash
git clone git@github.com:ereyli/AuraCreatures.git
cd AuraCreatures
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp apps/web/env.local.example apps/web/.env.local
```

4. Configure `.env.local` with your API keys (see [ADIM_ADIM_KURULUM.md](ADIM_ADIM_KURULUM.md))

5. Run database migrations:
```bash
cd apps/web
npm run migrate
```

6. Start development server:
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
AuraCreatures/
├── apps/
│   └── web/                    Next.js frontend
│       ├── app/                App router
│       ├── lib/                Utilities
│       ├── scripts/            Migrations
│       └── .env.local          Environment vars
├── packages/
│   ├── contracts/              Solidity contracts
│   │   ├── src/
│   │   │   └── XAnimalNFT.sol  Main ERC-721
│   │   ├── script/
│   │   │   └── Deploy.s.sol    Deployment
│   │   └── foundry.toml        Foundry config
│   └── shared/                 Shared types
│       └── src/
│           └── types.ts        TypeScript types
├── ADIM_ADIM_KURULUM.md        Setup guide (Turkish)
├── PRODUCTION_SETUP.md         Production guide
├── REMIX_DEPLOY_GUIDE.md       Contract deployment
└── README.md                   This file
```

## 🎯 Deployment

### Smart Contract (Base Sepolia)

1. Follow [REMIX_DEPLOY_GUIDE.md](REMIX_DEPLOY_GUIDE.md)
2. Deploy via Remix IDE
3. Update `CONTRACT_ADDRESS` in `.env.local`

### Frontend (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

See [ADIM_ADIM_KURULUM.md](ADIM_ADIM_KURULUM.md) for detailed instructions.

## 🔐 Environment Variables

See `apps/web/env.local.example` for full list:

**Required:**
- `DATABASE_URL` - Vercel Postgres
- `KV_REST_API_URL` - Vercel KV
- `KV_REST_API_TOKEN` - Vercel KV
- `INFERENCE_API_KEY` - Daydreams API
- `PINATA_JWT` or `WEB3_STORAGE_TOKEN` - IPFS
- `X_CLIENT_ID` - X OAuth
- `X_CLIENT_SECRET` - X OAuth
- `CONTRACT_ADDRESS` - Deployed contract
- `SERVER_SIGNER_PRIVATE_KEY` - Mint permit signing

**Optional:**
- `X402_FACILITATOR_URL` - Payment facilitator
- `COLLECTION_THEME` - Theme name (default: "frog")
- `MODEL_VERSION` - Model version (default: "v1.0.0")

## 🔗 Contracts

- **AuraCreaturesNFT**: `0x1bAF2796536752B57A957f67637Bd6457bE25157` (Base Sepolia)
- **Network**: Base Sepolia
- **Standard**: ERC-721 with EIP-712 signing

## 📚 Documentation

- [ADIM_ADIM_KURULUM.md](ADIM_ADIM_KURULUM.md) - Turkish setup guide
- [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) - Production deployment
- [REMIX_DEPLOY_GUIDE.md](REMIX_DEPLOY_GUIDE.md) - Contract deployment
- [SERVISLER_NEDIR.md](SERVISLER_NEDIR.md) - Services explanation (Turkish)

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14
- React 18
- Tailwind CSS
- Viem (Ethereum client)

**Backend:**
- Next.js API Routes
- Drizzle ORM
- Vercel Postgres
- Vercel KV (Redis)

**Blockchain:**
- Solidity 0.8.20
- OpenZeppelin Contracts
- Foundry
- Base Sepolia

**AI & Storage:**
- Daydreams AI API
- Pinata / Web3.Storage
- IPFS

**Payments:**
- x402 Protocol
- USDC

## 🤝 Contributing

This is a private project. Contributions welcome via issues and pull requests.

## 📄 License

MIT License - see LICENSE file

## 🙏 Credits

- [Daydreams AI](https://daydreams.systems/) for image generation
- [x402 Protocol](https://x402.dev/) for payments
- [Base](https://base.org/) for blockchain infrastructure

---

**Made with ❤️ for the Aura Creatures community**
