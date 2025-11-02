# 🚀 Adım Adım Kurulum Rehberi

## ✅ Hazır Olanlar

- ✅ Contract deployed (Base Sepolia): `0x1bAF2796536752B57A957f67637Bd6457bE25157`
- ✅ Daydreams API key: `sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb`
- ✅ Migration script: `apps/web/scripts/migrate.ts`
- ✅ Frontend ve backend kodları

---

## 📋 Eksikler

1. **Vercel Postgres** (Database)
2. **Vercel KV** (Redis)
3. **IPFS Provider** (Pinata veya Web3.Storage)
4. **X OAuth** (Twitter Developer Account)

---

## 🎯 ADIM 1: Vercel Postgres Kurulumu

### 1.1 Vercel Hesabı Oluştur

1. https://vercel.com adresine git
2. "Sign Up" → GitHub ile kaydol
3. Dashboard'a git

### 1.2 Postgres Database Oluştur

1. Sol menüden **"Storage"** seç
2. **"Create Database"** butonuna tıkla
3. **"Postgres"** seç
4. İsim ver: `aura-creatures-db` (herhangi bir isim)
5. Region seç: `US East (N. Virginia)` veya `EU West (Ireland)`
6. **"Create"** butonuna tıkla

### 1.3 Connection String Kopyala

1. Oluşturulan database'e tıkla
2. **"Settings"** tab'ına git
3. **"Connection string"** altında **".env.local"** formatını seç
4. Connection string'i kopyala (örnek format):

```
postgres://default:xxxxx@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 1.4 .env.local Dosyasına Ekle

1. `apps/web/.env.local` dosyasını aç
2. `DATABASE_URL` değişkenini bul
3. Kopyaladığın connection string'i yapıştır

```env
DATABASE_URL=postgres://default:xxxxx@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 1.5 Migration Çalıştır

Terminal'de:

```bash
cd apps/web
npm run migrate
```

**Beklenen çıktı:**
```
Running database migrations...
Database: postgres://default:****@aws-0-us-east-1.pooler.supabase.com:6543/postgres
✓ users table created
✓ tokens table created
✓ payments table created
✓ indexes created

✅ All migrations completed successfully!
```

**Hata alırsan:**
- `DATABASE_URL` doğru mu kontrol et
- Vercel'de database'in oluşturulduğunu doğrula
- Connection string formatını kontrol et

---

## 🎯 ADIM 2: Vercel KV (Redis) Kurulumu

### 2.1 KV Database Oluştur

1. Vercel Dashboard → **"Storage"**
2. **"Create Database"** → **"KV"**
3. İsim ver: `aura-creatures-kv`
4. Region seç: Aynı region (Postgres ile aynı olması iyi)
5. **"Create"**

### 2.2 REST API Bilgilerini Al

1. Oluşturulan KV database'e tıkla
2. **"Settings"** tab'ına git
3. **"REST API"** altında:
   - **REST API URL**'i kopyala
   - **REST API Token**'ı kopyala

### 2.3 .env.local Dosyasına Ekle

```env
KV_REST_API_URL=https://your-kv-instance.upstash.io
KV_REST_API_TOKEN=AUrJ9yAgDJSjXmxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
```

---

## 🎯 ADIM 3: IPFS Provider Kurulumu

### Seçenek A: Pinata (Önerilen - Kolay)

1. https://www.pinata.cloud adresine git
2. "Sign Up" → Email ile kaydol
3. Email'i doğrula
4. **"API Keys"** menüsüne git
5. **"New Key"** butonuna tıkla
6. İsim ver: `aura-creatures-nft`
7. Permissions: **Upload** ve **Pin** aktif
8. **"Create Key"** butonuna tıkla
9. JWT token'ı kopyala

**.env.local:**
```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

### Seçenek B: Web3.Storage (Alternatif)

1. https://web3.storage adresine git
2. "Sign Up" → GitHub ile kaydol
3. "Account" → **"Create API Token"**
4. İsim ver: `aura-creatures`
5. Token'ı kopyala

**.env.local:**
```env
WEB3_STORAGE_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx...
```

**NOT:** İkisinden sadece **birisini** seç. Ben Pinata öneriyorum.

---

## 🎯 ADIM 4: X OAuth Kurulumu

### 4.1 X Developer Hesabı Al

1. https://developer.twitter.com/en/portal/petition/essential/basic-info adresine git
2. "Apply for a developer account" butonuna tıkla
3. Formu doldur (proje açıklaması önemli)
4. Bekle (onay 1-3 gün sürebilir)

### 4.2 OAuth App Oluştur

1. X Developer Portal → **"Projects & Apps"**
2. "Create App" butonuna tıkla
3. App Details:
   - App name: `Aura Creatures NFT`
   - Environment: `Production`
4. **"OAuth 2.0 Settings"** sekmesine git
5. **Callback URI**: `http://localhost:3000/api/auth/x/callback` (production için Vercel URL'i)
6. **App permissions**: Read users
7. **"Save"** butonuna tıkla

### 4.3 API Keys Kopyala

1. **"Keys and Tokens"** sekmesine git
2. **OAuth 2.0 Client ID**'yi kopyala
3. **OAuth 2.0 Client Secret**'ı kopyala (kalıcı gösterme seçeneğini aç)

**.env.local:**
```env
X_CLIENT_ID=your_client_id_here
X_CLIENT_SECRET=your_client_secret_here
X_CALLBACK_URL=http://localhost:3000/api/auth/x/callback
```

---

## 🎯 ADIM 5: Development Mode Test

Tüm servisleri kurduktan sonra:

```bash
cd apps/web
npm run dev
```

**Test et:**
1. http://localhost:3000 aç
2. "Test Mode" ile görsel üret
3. Wallet bağla ve mint dene

**Konsol'da hata var mı bak:**
- Database connection? ✅
- KV connection? ✅
- IPFS upload? ✅
- X OAuth? (opsiyonel şimdilik)

---

## 🎯 ADIM 6: Vercel'e Deploy

### 6.1 GitHub Repository

1. GitHub'da yeni repo oluştur: `aura-creatures-nft`
2. Kodu push et:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/aura-creatures-nft.git
git push -u origin main
```

### 6.2 Vercel Deploy

1. Vercel Dashboard → **"Add New"** → **"Project"**
2. GitHub repo'yu bağla
3. **"Import"** butonuna tıkla
4. Framework: Next.js otomatik algılanacak
5. Root Directory: `apps/web`
6. **"Deploy"** butonuna tıkla

### 6.3 Environment Variables Ekle

Deploy başladıktan sonra:

1. Project → **"Settings"** → **"Environment Variables"**
2. Aşağıdaki değişkenleri tek tek ekle:

```
NEXT_PUBLIC_CHAIN_ID=84532
RPC_URL=https://sepolia.base.org
CONTRACT_ADDRESS=0x1bAF2796536752B57A957f67637Bd6457bE25157
SERVER_SIGNER_PRIVATE_KEY=your_server_wallet_private_key

X_CLIENT_ID=your_client_id
X_CLIENT_SECRET=your_client_secret
X_CALLBACK_URL=https://your-app.vercel.app/api/auth/x/callback

PINATA_JWT=your_pinata_jwt

INFERENCE_API_KEY=sk-router-983974339998ee49f27eb07de7b7af1f941c50ceb19bf86ac22adf9d16c3a3fb

DATABASE_URL=your_postgres_connection_string

KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token

X402_FACILITATOR_URL=
X402_PRICE_USDC=2000000

COLLECTION_THEME=frog
MODEL_VERSION=v1.0.0
```

3. **"Save"** butonuna tıkla
4. **"Redeploy"** butonuna tıkla

### 6.4 X OAuth Callback URL Güncelle

1. X Developer Portal'a git
2. App → **"Settings"** → **"Callback URI"**
3. Production URL'i ekle: `https://your-app.vercel.app/api/auth/x/callback`
4. **"Save"**

---

## ✅ Success Checklist

- [ ] Vercel Postgres oluşturuldu ve migration çalıştırıldı
- [ ] Vercel KV oluşturuldu ve bağlandı
- [ ] Pinata veya Web3.Storage token alındı
- [ ] X OAuth credentials alındı (veya opsiyonel)
- [ ] Local test başarılı
- [ ] GitHub repo oluşturuldu ve push edildi
- [ ] Vercel deploy yapıldı
- [ ] Environment variables eklendi
- [ ] Production test başarılı

---

## 🐛 Yaygın Hatalar

### "Database connection failed"
- `DATABASE_URL` kontrol et
- Vercel'de database oluşturuldu mu?
- Connection string formatı doğru mu?

### "KV connection failed"
- `KV_REST_API_URL` ve `KV_REST_API_TOKEN` kontrol et
- KV database oluşturuldu mu?

### "IPFS upload failed"
- Pinata JWT token doğru mu?
- Pinata hesabında credit var mı?

### "X OAuth failed"
- Client ID ve Secret doğru mu?
- Callback URL production URL'ine ayarlandı mı?

### "Contract interaction failed"
- `CONTRACT_ADDRESS` doğru mu?
- `RPC_URL` erişilebilir mi?
- Network Base Sepolia mı?

---

## 📞 Yardım

Herhangi bir adımda takılırsan, ekrana çıkan hata mesajını paylaş. Birlikte çözelim! 🚀

**Şimdi hangi adımda yardıma ihtiyacın var?**

