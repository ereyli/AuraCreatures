# Local Development Setup Guide - Tam Setup

## Ön Gereksinimler

1. **Node.js** (v18+)
2. **Foundry** (smart contract deployment için)
3. **Git**
4. **Vercel Account** (ücretsiz) - Database ve KV için

## Adım 1: Servisleri Kurma

### 1.1 Vercel Postgres Database

1. https://vercel.com/dashboard adresine git
2. Yeni proje oluştur veya mevcut projeye git
3. **Storage** sekmesine git
4. **Postgres** seç ve **Create Database** tıkla
5. Database oluşturulduktan sonra **.env.local** tab'ına git
6. `DATABASE_URL` değerini kopyala

### 1.2 Vercel KV (Redis)

1. Aynı Vercel projesinde **Storage** sekmesine git
2. **KV** (Redis) seç ve **Create Database** tıkla
3. KV oluşturulduktan sonra **.env.local** tab'ına git
4. `KV_REST_API_URL` ve `KV_REST_API_TOKEN` değerlerini kopyala

### 1.3 X (Twitter) OAuth App

1. https://developer.twitter.com/en/portal/dashboard adresine git
2. Yeni app oluştur
3. **Keys and tokens** sekmesine git
4. **OAuth 2.0 Client ID and Client Secret** oluştur
5. **App Settings** → **User authentication settings**:
   - App permissions: Read
   - Type of App: Web App
   - Callback URI: `http://localhost:3000/api/auth/x/callback`
   - Website URL: `http://localhost:3000`
6. `X_CLIENT_ID` ve `X_CLIENT_SECRET` değerlerini kopyala

### 1.4 IPFS Provider (Pinata veya Web3.Storage)

**Seçenek A: Pinata**
1. https://www.pinata.cloud/ adresine git
2. Hesap oluştur
3. API Keys sekmesine git
4. Yeni JWT token oluştur
5. Token'ı `PINATA_JWT` olarak kopyala

**Seçenek B: Web3.Storage**
1. https://web3.storage/ adresine git
2. Hesap oluştur
3. API Tokens sekmesine git
4. Yeni token oluştur
5. Token'ı `WEB3_STORAGE_TOKEN` olarak kopyala

### 1.5 Daydreams API Key

1. https://docs.daydreams.systems/ adresine git
2. API key almak için kayıt ol
3. API key'i `INFERENCE_API_KEY` olarak kopyala

## Adım 2: Environment Variables Ayarlama

1. `apps/web/env.local.example` dosyasını `.env.local` olarak kopyala:
   ```bash
   cd apps/web
   cp env.local.example .env.local
   ```

2. `.env.local` dosyasını aç ve tüm değerleri doldur

## Adım 3: Smart Contract Deployment (Base Sepolia)

### 3.1 Test ETH Al (Base Sepolia)

1. Base Sepolia faucet'ten test ETH al:
   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - veya https://faucet.quicknode.com/base/sepolia

### 3.2 Contract Deploy

```bash
cd packages/contracts
forge build
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url $RPC_URL \
  --private-key $SERVER_SIGNER_PRIVATE_KEY \
  --broadcast
```

## Adım 4: Database Migration

```bash
cd apps/web
npm install
npm run migrate
```

## Adım 5: Development Server Başlat

```bash
cd apps/web
npm run dev
```

Server `http://localhost:3000` adresinde çalışacak.

## Adım 6: Test Et

1. Tarayıcıda `http://localhost:3000` aç
2. "Connect X Account" butonuna tıkla
3. X OAuth flow'unu tamamla
4. Wallet bağla (MetaMask)
5. NFT generate et
6. Mint işlemini test et
