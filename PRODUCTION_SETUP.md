# Production Setup Guide - Aura Creatures NFT

## 🎯 Current Status

✅ **Ready:**
- Contract deployed to Base Sepolia: `0x1bAF2796536752B57A957f67637Bd6457bE25157`
- Daydreams API key configured
- Frontend and backend routes complete

❌ **Need Setup:**
1. Vercel Postgres Database
2. Vercel KV (Redis) for rate limiting
3. IPFS Pinning (Pinata or Web3.Storage)
4. X OAuth credentials
5. x402 payment facilitator
6. Production environment variables

---

## 📋 Step-by-Step Production Setup

### 1️⃣ Create Vercel Account & Project

1. Go to https://vercel.com
2. Sign up/login with GitHub
3. Click "Add New" → "Project"
4. Connect your GitHub repository

---

### 2️⃣ Setup Vercel Postgres Database

1. In Vercel dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Choose region (US or EU)
4. Click "Create"
5. Copy the connection string

**Update `.env.local`:**
```env
DATABASE_URL=postgresql://default:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Run migrations:**
```bash
cd apps/web
npm run migrate
```

---

### 3️⃣ Setup Vercel KV (Redis)

1. In Vercel dashboard, go to "Storage"
2. Click "Create Database" → "KV"
3. Choose region
4. Click "Create"
5. Copy REST API URL and REST API Token

**Update `.env.local`:**
```env
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=your_kv_token_here
```

---

### 4️⃣ Setup IPFS Pinning

**Option A: Pinata (Recommended)**

1. Go to https://www.pinata.cloud
2. Sign up for free account
3. Go to "API Keys"
4. Create new JWT token
5. Copy JWT token

**Update `.env.local`:**
```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option B: Web3.Storage**

1. Go to https://web3.storage
2. Sign up with GitHub
3. Go to "Account" → "Create API Token"
4. Copy token

**Update `.env.local`:**
```env
WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 5️⃣ Setup X (Twitter) OAuth

1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a new app
3. Enable OAuth 2.0
4. Set callback URL: `https://your-vercel-app.vercel.app/api/auth/x/callback`
5. Copy Client ID and Client Secret

**Update `.env.local`:**
```env
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_CALLBACK_URL=https://your-vercel-app.vercel.app/api/auth/x/callback
```

---

### 6️⃣ Setup x402 Payment Facilitator

**For now, use basic verification without facilitator:**

**Update `.env.local`:**
```env
X402_FACILITATOR_URL=
X402_PRICE_USDC=2000000
```

⚠️ **Note:** In production, implement proper x402 payment verification or use a facilitator service.

---

### 7️⃣ Deploy to Vercel

1. Push your code to GitHub
2. In Vercel, click "Deploy"
3. Add environment variables (from `.env.local`)
4. Click "Deploy"

**Required Environment Variables for Vercel:**
```
NEXT_PUBLIC_CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x1bAF2796536752B57A957f67637Bd6457bE25157
SERVER_SIGNER_PRIVATE_KEY=your_server_wallet_private_key

X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_CALLBACK_URL=https://your-app.vercel.app/api/auth/x/callback

PINATA_JWT=your_pinata_jwt
# OR
WEB3_STORAGE_TOKEN=your_web3_storage_token

INFERENCE_API_KEY=sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb

DATABASE_URL=your_postgres_connection_string

KV_REST_API_URL=your_kv_api_url
KV_REST_API_TOKEN=your_kv_token

X402_FACILITATOR_URL=
X402_PRICE_USDC=2000000

COLLECTION_THEME=frog
MODEL_VERSION=v1.0.0
```

---

### 8️⃣ Test Production Flow

1. Open your Vercel deployment URL
2. Test X OAuth connection
3. Generate an NFT
4. Connect wallet and mint

---

## 🔐 Security Checklist

- [ ] Never commit private keys to GitHub
- [ ] Use Vercel environment variables for secrets
- [ ] Server signer wallet has Base Sepolia ETH
- [ ] X OAuth callback URL matches production URL
- [ ] Daydreams account has sufficient balance
- [ ] IPFS provider credentials secured

---

## 🐛 Troubleshooting

**"Database connection failed":**
- Check DATABASE_URL format
- Verify database is created in Vercel
- Run migrations

**"KV connection failed":**
- Check KV_REST_API_URL and KV_REST_API_TOKEN
- Verify KV database is created

**"IPFS upload failed":**
- Check PINATA_JWT or WEB3_STORAGE_TOKEN
- Verify account has storage credits

**"X OAuth failed":**
- Check callback URL matches X app settings
- Verify X_CLIENT_ID and X_CLIENT_SECRET

**"Contract interaction failed":**
- Check CONTRACT_ADDRESS is correct
- Verify RPC_URL is accessible
- Check network is Base Sepolia

---

## 📊 Cost Estimates

**Free Tier:**
- Vercel Postgres: 256 MB free
- Vercel KV: 10,000 commands/day free
- Pinata: 1 GB free/month
- Web3.Storage: 5 GB free/month
- Daydreams: Pay per use (~$0.04-0.06/image)
- Base Sepolia: Free test ETH

**Production Costs:**
- Vercel Pro: $20/month (recommended)
- Pinata Pro: $20/month (if needed)
- Daydreams: ~$40-60/month (1000 images)

---

## ✅ Next Steps

1. Setup Vercel Postgres
2. Setup Vercel KV
3. Get IPFS provider API key
4. Get X OAuth credentials
5. Add environment variables to Vercel
6. Deploy and test

**Ready to start? Let me know which service you want to set up first!** 🚀

