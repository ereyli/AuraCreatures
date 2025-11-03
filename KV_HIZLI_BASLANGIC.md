# ⚡ KV Hızlı Başlangıç - 5 Dakikada Kurulum

## 🎯 Hızlı Adımlar

### 1. Vercel Dashboard
1. https://vercel.com/dashboard → Projeni aç
2. **Storage** → **Create Database** → **KV**
3. İsim: `aura-creatures-kv` → **Create**

### 2. REST API Bilgileri
1. KV database'e tıkla → **Settings**
2. **REST API URL** → Kopyala
3. **REST API Token** → Kopyala

### 3. Vercel Environment Variables
1. **Settings** → **Environment Variables**
2. Ekle:
   - `KV_REST_API_URL` = (kopyaladığın URL)
   - `KV_REST_API_TOKEN` = (kopyaladığın Token)
3. Environment seç: **Production, Preview, Development**
4. **Save**

### 4. Test Et
1. Vercel'de redeploy et (environment variable'lar için)
2. X OAuth bağlantısını dene
3. Console loglarında `✅ Vercel KV connected successfully` görünürse başarılı!

## ✅ Başarı Kontrolü

- ✅ Console'da `✅ Vercel KV connected successfully`
- ✅ Console'da `✅ PKCE verifier stored in KV`
- ❌ **YOKSA:** `⚠️ KV not available - will use encrypted cookie as fallback`

## 🆘 Sorun mu var?

- Environment variable'lar Vercel'de eklendi mi?
- Doğru environment'ta mı? (Production/Preview/Development)
- KV database aktif mi?
- Vercel'de redeploy yaptın mı? (Environment variable'lar için gerekli)

**Detaylı kurulum:** `KV_KURULUM.md` dosyasına bak

