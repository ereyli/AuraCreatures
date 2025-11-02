# 🚀 Vercel Deployment Guide

## ✅ GitHub Hazır

Repository: `git@github.com:ereyli/AuraCreatures.git`

---

## 📋 Vercel'e Deploy Et

### 1. Vercel Hesabı

1. https://vercel.com → **"Sign Up"** (GitHub ile)
2. Dashboard'a git

### 2. Yeni Proje Oluştur

1. **"Add New"** → **"Project"**
2. **"Import Git Repository"**
3. GitHub repo'yu bağla: `ereyli/AuraCreatures`
4. **"Import"**

### 3. Proje Ayarları

**Framework Preset:** Next.js (otomatik algılanır) ✅

**Root Directory:** `apps/web` ⚠️ **ÖNEMLİ!**

**Build Command:** `npm run build` (otomatik)
**Output Directory:** `.next` (otomatik)
**Install Command:** `npm install` (otomatik)

**Deploy:** Butona tıkla

⏳ İlk deploy başlıyor (1-2 dakika)...

---

## ⚠️ HATA: Build Failed

İlk deploy'da **build hatası** alacaksın çünkü:
- Environment variables yok
- Database bağlantısı yok
- API keys eksik

**Normal!** Şimdi environment variables ekleyeceğiz.

---

## 🔐 Environment Variables Ekle

### Deploy Sonrası:

1. Project'e git
2. **"Settings"** → **"Environment Variables"**
3. Aşağıdaki değişkenleri **tek tek** ekle:

---

### ✅ HAZIR OLANLAR (Şimdi Ekle)

```
NEXT_PUBLIC_CHAIN_ID=84532

RPC_URL=https://sepolia.base.org

CONTRACT_ADDRESS=0x1bAF2796536752B57A957f67637Bd6457bE25157

INFERENCE_API_KEY=sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb

COLLECTION_THEME=frog

MODEL_VERSION=v1.0.0

X402_PRICE_USDC=2000000

X402_FACILITATOR_URL=
```

---

### ⏳ SONRA EKLENECEK (Sırayla Kur)

#### 1️⃣ Vercel Postgres

1. Dashboard → **"Storage"** → **"Create Database"** → **"Postgres"**
2. Connection string'i kopyala
3. Environment Variable olarak ekle:

```
DATABASE_URL=postgres://default:xxxxx@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

4. **"Save"**
5. Terminal'de migration çalıştır:

```bash
cd apps/web
npm run migrate
```

**VEYA:** Vercel Production Shell kullan:

```bash
vercel --prod
# Shell'e gir ve migrate çalıştır
```

---

#### 2️⃣ Vercel KV

1. Dashboard → **"Storage"** → **"Create Database"** → **"KV"**
2. REST API URL ve Token'ı kopyala
3. Environment Variables:

```
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=AUrJ9yAgDJSjXmxxxxx
```

---

#### 3️⃣ IPFS - Pinata (Önerilen)

1. https://www.pinata.cloud → Sign Up
2. **"API Keys"** → **"New Key"**
3. JWT token'ı kopyala
4. Environment Variable:

```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

---

#### 4️⃣ X OAuth

1. https://developer.twitter.com/en/portal → Apply
2. App oluştur → OAuth 2.0
3. Callback URL: `https://your-app.vercel.app/api/auth/x/callback`
4. Environment Variables:

```
X_CLIENT_ID=your_x_client_id
X_CLIENT_SECRET=your_x_client_secret
X_CALLBACK_URL=https://your-app.vercel.app/api/auth/x/callback
```

---

#### 5️⃣ Server Signer Wallet

**Önemli:** Mint permit sign etmek için private key gerekli!

1. Yeni wallet oluştur (MetaMask, ArgentX)
2. Private key'i kopyala (DİKKAT: GÜVENLİ TUT!)
3. Environment Variable:

```
SERVER_SIGNER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
```

4. Base Sepolia'da ETH gönder (gas için)

---

## 🔄 Redeploy

Her environment variable ekledikten sonra:

1. Project → **"Deployments"**
2. **"Redeploy"** butonuna tıkla
3. Veya otomatik deploy olur

---

## ✅ Vercel Dashboard'da Checklist

### Environment Variables Kontrol:

- [ ] `NEXT_PUBLIC_CHAIN_ID`
- [ ] `RPC_URL`
- [ ] `CONTRACT_ADDRESS`
- [ ] `INFERENCE_API_KEY` ✅
- [ ] `COLLECTION_THEME`
- [ ] `MODEL_VERSION`
- [ ] `X402_PRICE_USDC`
- [ ] `DATABASE_URL` ⏳
- [ ] `KV_REST_API_URL` ⏳
- [ ] `KV_REST_API_TOKEN` ⏳
- [ ] `PINATA_JWT` ⏳
- [ ] `X_CLIENT_ID` ⏳
- [ ] `X_CLIENT_SECRET` ⏳
- [ ] `X_CALLBACK_URL` ⏳
- [ ] `SERVER_SIGNER_PRIVATE_KEY` ⏳

### Storage Kontrol:

- [ ] Vercel Postgres oluşturuldu
- [ ] Vercel KV oluşturuldu
- [ ] Migration çalıştırıldı (Postgres'te users, tokens, payments tabloları var)

---

## 🧪 Test

### 1. Ana Sayfa

URL: `https://your-app.vercel.app`

✅ Sayfa açılıyor mu?
✅ "Connect X" butonu var mı?

### 2. Test Mode

1. "Test Mode (Skip Connections)" toggle aç
2. X profile image URL gir
3. "Generate NFT" tıkla

**Hata mesajları:**
- "Database connection failed" → `DATABASE_URL` yok
- "KV connection failed" → `KV_REST_API_URL` yok
- "IPFS upload failed" → `PINATA_JWT` yok
- "Image generation failed" → `INFERENCE_API_KEY` yanlış

### 3. Mint Test

1. Wallet bağla (MetaMask, Base Sepolia)
2. "Mint" butonuna tıkla

**Hata mesajları:**
- "Token not generated" → Generate step atlanmış
- "Invalid signature" → `SERVER_SIGNER_PRIVATE_KEY` yanlış
- "Contract call failed" → `CONTRACT_ADDRESS` yanlış

---

## 🐛 Yaygın Sorunlar

### "Module not found"

**Çözüm:** Root directory `apps/web` olmalı

### "Build failed - DATABASE_URL required"

**Çözüm:** Mock mode kapatıldı. `DATABASE_URL` ekle veya `isMockMode` logic'i düzelt

### "Function exceeded timeout"

**Çözüm:** Daydreams API yavaş. Timeout süresini artır

### "Internal Server Error"

**Çözüm:** 
1. Vercel Logs'a bak
2. Hangi API route'da hata?
3. Environment variable eksik mi?

---

## 📊 Sonraki Adımlar

✅ **Deploy yapıldı**
✅ **Environment variables eklendi**
✅ **Test başarılı**

Şimdi:
1. Domain ekle (opsiyonel)
2. Custom branding
3. Analytics ekle
4. Mainnet'e hazırla

---

## 🔗 Use ful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Storage: https://vercel.com/storage
- Project Logs: https://vercel.com/your-app/deployments
- Environment Variables: Settings → Environment Variables

---

**Başarılar! 🎉**

