# 🔐 Vercel Environment Variables - Tam Liste

Vercel Dashboard → Project → Settings → Environment Variables

## ✅ ZORUNLU (Production için)

### 1. Blockchain Configuration

```
NEXT_PUBLIC_CHAIN_ID=84532
```
**Açıklama:** Base Sepolia Chain ID (testnet için)

```
RPC_URL=https://sepolia.base.org
```
**Açıklama:** Base Sepolia RPC URL (production için daha iyi bir RPC kullan: Alchemy, Infura)

```
CONTRACT_ADDRESS=0x1bAF2796536752B57A957f67637Bd6457bE25157
```
**Açıklama:** Deployed contract address (Base Sepolia'da)

```
SERVER_SIGNER_PRIVATE_KEY=0x...
```
**Açıklama:** Mint permit için wallet private key (GÜVENLİ TUT!)
**Önemli:** Production'da yeni bir wallet oluştur ve sadece gas için ETH gönder

---

### 2. Database - Supabase (Önerilen)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Örnek:**
```
DATABASE_URL=postgresql://postgres:MyPassword123!@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres
```

**Nasıl Alınır:**
1. Supabase Dashboard → Settings → Database
2. Connection string → URI tab
3. `[PASSWORD]` kısmını database password ile değiştir

**Not:** Supabase kullanıyorsan, KV_REST_API_URL gerekmez (Supabase KV kullanılır)

---

### 3. AI Image Generation - Daydreams

```
INFERENCE_API_KEY=sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb
```
**Açıklama:** Daydreams API key (zaten var ✅)

---

### 4. IPFS - Pinata (Önerilen) veya Web3.Storage

**Seçenek A: Pinata (Önerilen)**
```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```
**Boş bırakılamaz:** IPFS upload için gerekli

**Seçenek B: Web3.Storage (Alternatif)**
```
WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```
**Not:** Sadece birini kullan (PINATA_JWT veya WEB3_STORAGE_TOKEN)

---

### 5. X OAuth (Production için)

```
X_CLIENT_ID=your_x_client_id_here
```
**Açıklama:** X Developer Portal → OAuth 2.0 Client ID

```
X_CLIENT_SECRET=your_x_client_secret_here
```
**Açıklama:** X Developer Portal → OAuth 2.0 Client Secret

```
X_CALLBACK_URL=https://your-app.vercel.app/api/auth/x/callback
```
**Açıklama:** Vercel deployment URL'in (örn: `https://aura-creatures.vercel.app/api/auth/x/callback`)
**Önemli:** X Developer Portal'da bu URL'i callback URI olarak ekle!

---

## ⚙️ OPSIYONEL (Varsayılanlar var)

### 6. Collection Settings

```
COLLECTION_THEME=frog
```
**Varsayılan:** `frog` (değiştirmek istersen)

```
MODEL_VERSION=v1.0.0
```
**Varsayılan:** `v1.0.0` (değiştirmek istersen)

```
X402_PRICE_USDC=2000000
```
**Varsayılan:** `2000000` (2 USDC, 6 decimals)
**Açıklama:** NFT mint fiyatı

---

### 7. x402 Payment Protocol (Opsiyonel)

```
X402_FACILITATOR_URL=
```
**Opsiyonel:** x402 facilitator URL (boş bırakılabilir)

---

### 8. Vercel KV (Opsiyonel - Supabase KV tercih edilir)

**Not:** Supabase kullanıyorsan bu değişkenlere gerek YOK (Supabase KV otomatik kullanılır)

Eğer Vercel KV kullanmak istersen:
```
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=AUrJ9yAgDJSjXmxxxxx
```

---

## 📋 Vercel'de Ekleme Sırası

### 1️⃣ İlk Deploy için Minimum (Build çalışsın)

```
NEXT_PUBLIC_CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x1bAF2796536752B57A957f67637Bd6457bE25157
INFERENCE_API_KEY=sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb
COLLECTION_THEME=frog
MODEL_VERSION=v1.0.0
X402_PRICE_USDC=2000000
```

### 2️⃣ Database (Supabase)

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3️⃣ IPFS (Pinata)

```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

### 4️⃣ X OAuth

```
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_CALLBACK_URL=https://your-app.vercel.app/api/auth/x/callback
```

### 5️⃣ Server Signer (Mint için)

```
SERVER_SIGNER_PRIVATE_KEY=0x...
```

---

## ✅ Checklist

### Production için ZORUNLU:

- [x] `NEXT_PUBLIC_CHAIN_ID`
- [x] `RPC_URL`
- [x] `CONTRACT_ADDRESS`
- [x] `INFERENCE_API_KEY` ✅
- [ ] `DATABASE_URL` ⏳ (Supabase connection string ekle)
- [ ] `PINATA_JWT` ⏳ (veya `WEB3_STORAGE_TOKEN`)
- [ ] `X_CLIENT_ID` ⏳
- [ ] `X_CLIENT_SECRET` ⏳
- [ ] `X_CALLBACK_URL` ⏳ (Vercel URL)
- [ ] `SERVER_SIGNER_PRIVATE_KEY` ⏳

### Opsiyonel (Varsayılanlar var):

- [x] `COLLECTION_THEME` (varsayılan: frog)
- [x] `MODEL_VERSION` (varsayılan: v1.0.0)
- [x] `X402_PRICE_USDC` (varsayılan: 2000000)
- [ ] `X402_FACILITATOR_URL` (opsiyonel)
- [ ] `KV_REST_API_URL` (opsiyonel - Supabase KV kullanıyorsan gerek yok)
- [ ] `KV_REST_API_TOKEN` (opsiyonel - Supabase KV kullanıyorsan gerek yok)

---

## 🔄 Environment Seçimi

Her variable eklerken **3 environment'ı seç:**
- ✅ **Production** (canlı site için)
- ✅ **Preview** (pull request'ler için)
- ✅ **Development** (local test için - opsiyonel)

---

## 🎯 Hızlı Kopyala-Yapıştır

Vercel Dashboard → Settings → Environment Variables → Add:

### 1. Blockchain
```
NEXT_PUBLIC_CHAIN_ID
84532
✅ Production, Preview, Development

RPC_URL
https://sepolia.base.org
✅ Production, Preview, Development

CONTRACT_ADDRESS
0x1bAF2796536752B57A957f67637Bd6457bE25157
✅ Production, Preview, Development
```

### 2. Database (Supabase)
```
DATABASE_URL
postgresql://postgres:[PASSWORD]@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres
✅ Production, Preview, Development
```

### 3. AI & IPFS
```
INFERENCE_API_KEY
sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb
✅ Production, Preview, Development

PINATA_JWT
[PINATA JWT TOKEN BURAYA]
✅ Production, Preview, Development
```

### 4. X OAuth
```
X_CLIENT_ID
[X CLIENT ID BURAYA]
✅ Production, Preview, Development

X_CLIENT_SECRET
[X CLIENT SECRET BURAYA]
✅ Production, Preview, Development

X_CALLBACK_URL
https://your-app.vercel.app/api/auth/x/callback
✅ Production, Preview, Development
```

### 5. Server Signer
```
SERVER_SIGNER_PRIVATE_KEY
0x[YOUR PRIVATE KEY BURAYA]
✅ Production, Preview, Development
```

---

## ⚠️ Önemli Notlar

1. **X_CALLBACK_URL:** Vercel deployment URL'in ile değiştir!
2. **DATABASE_URL:** Supabase password'ü doğru yaz!
3. **SERVER_SIGNER_PRIVATE_KEY:** GÜVENLİ TUT! Production'da yeni wallet oluştur
4. **Environment Seçimi:** Her variable için Production, Preview, Development seç

---

**Tüm variable'ları ekledikten sonra Redeploy et!** 🚀
