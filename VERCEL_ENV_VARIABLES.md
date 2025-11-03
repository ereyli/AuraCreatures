# 🔐 Vercel Environment Variables - Ekleme Rehberi

## ✅ Durum
- ✅ Proje Vercel'de çalışıyor
- ⏳ Environment variables eklenecek

---

## 📋 Vercel'e Eklenecek Environment Variables

### 1️⃣ Vercel Dashboard'a Git

1. https://vercel.com/dashboard
2. **Projen'i seç:** `aura-creatures` (veya proje adın)
3. **Settings** → **Environment Variables**

---

### 2️⃣ Environment Variables Ekle

Aşağıdaki değişkenleri **tek tek** ekle:

#### ✅ Zorunlu Olanlar:

**1. Daydreams API Key:**
```
INFERENCE_API_KEY=sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb
```

**2. X OAuth (eğer X app oluşturduysan):**
```
X_CLIENT_ID=your_x_client_id_here
X_CLIENT_SECRET=your_x_client_secret_here
X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback
```

**3. Blockchain:**
```
NEXT_PUBLIC_CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x1bAF2796536752B57A957f67637Bd6457bE25157
SERVER_SIGNER_PRIVATE_KEY=your_server_wallet_private_key_here
```

**4. Collection Settings:**
```
COLLECTION_THEME=frog
MODEL_VERSION=v1.0.0
X402_PRICE_USDC=2000000
```

---

#### ⏳ Sonra Eklenecekler (Opsiyonel):

**5. Database (Vercel Postgres kurulunca):**
```
DATABASE_URL=postgres://default:xxxxx@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**6. KV (Vercel KV kurulunca):**
```
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=your_kv_token_here
```

**7. IPFS (Pinata kurulunca):**
```
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**VEYA Web3.Storage:**
```
WEB3_STORAGE_TOKEN=your_web3_storage_token_here
```

---

### 3️⃣ Environment Variables Nasıl Eklenir?

Her değişken için:

1. **"Add New"** butonuna tıkla
2. **Key** field'ına değişken adını yaz (örn: `INFERENCE_API_KEY`)
3. **Value** field'ına değeri yapıştır (örn: `sk-router-983974...`)
4. **Environment** seç:
   - ✅ **Production**
   - ✅ **Preview** (opsiyonel)
   - ✅ **Development** (opsiyonel)
5. **"Save"** butonuna tıkla

**Not:** Her değişken için ayrı ayrı "Save" yap!

---

### 4️⃣ Daydreams API Key Ekleme

**Şimdi ekleyebilirsin:**

1. **Key:** `INFERENCE_API_KEY`
2. **Value:** `sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb`
3. **Environment:** Production (ve diğerleri istersen)
4. **Save**

✅ **Artık kodda görünmeyecek!** Sadece Vercel environment'ında tutulacak.

---

### 5️⃣ Redeploy

Environment variables ekledikten sonra:

1. **Deployments** sekmesine git
2. En son deployment'ı bul
3. **"Redeploy"** butonuna tıkla
4. ⏳ Deploy tamamlanmasını bekle

**Not:** Environment variables sadece yeni deploy'larda yüklenir!

---

## 🔒 Güvenlik Notları

- ⚠️ **API Key'leri ASLA GitHub'a commit etme!**
- ✅ Environment variables sadece Vercel'de tut
- ✅ `.env.local` dosyası `.gitignore`'da (zaten)
- ✅ Production'da gerçek değerler kullanılacak

---

## ✅ Checklist

- [ ] `INFERENCE_API_KEY` eklendi ✅ (ŞİMDİ EKLEYEBİLİRSİN)
- [ ] `NEXT_PUBLIC_CHAIN_ID` eklendi
- [ ] `RPC_URL` eklendi
- [ ] `CONTRACT_ADDRESS` eklendi
- [ ] `SERVER_SIGNER_PRIVATE_KEY` eklendi (sonra)
- [ ] `X_CLIENT_ID` eklendi (X app oluşturunca)
- [ ] `X_CLIENT_SECRET` eklendi (X app oluşturunca)
- [ ] `X_CALLBACK_URL` eklendi (X app oluşturunca)
- [ ] `DATABASE_URL` eklendi (Postgres kurulunca)
- [ ] `KV_REST_API_URL` eklendi (KV kurulunca)
- [ ] `KV_REST_API_TOKEN` eklendi (KV kurulunca)
- [ ] `PINATA_JWT` eklendi (IPFS kurulunca)
- [ ] Redeploy yapıldı

---

## 🎯 Şimdi Yap

1. **Vercel Dashboard** → Settings → Environment Variables
2. **INFERENCE_API_KEY** ekle (Daydreams API key)
3. **Save**
4. **Redeploy**

✅ **Artık API key güvenli!**

---

**Başarılar! 🚀**

