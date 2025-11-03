# 🚀 Vercel KV Kurulum Rehberi

Vercel KV (Redis) X OAuth PKCE için `code_verifier` saklamak, rate limiting ve cache için kullanılır.

## Adım 1: Vercel KV Database Oluştur

1. **Vercel Dashboard**'a git: https://vercel.com/dashboard
2. Projeni seç (veya yeni proje oluştur)
3. **Storage** sekmesine git
4. **"Create Database"** butonuna tıkla
5. **"KV"** seçeneğini seç
6. İsim ver: `aura-creatures-kv` (veya istediğin isim)
7. **Region seç**: 
   - Postgres ile aynı region seç (gecikme azalır)
   - Önerilen: `iad1` (US East) veya `fra1` (EU)
8. **"Create"** butonuna tıkla

## Adım 2: REST API Bilgilerini Al

1. Oluşturulan **KV database**'e tıkla
2. **"Settings"** tab'ına git
3. **"REST API"** bölümünü bul:
   - **REST API URL** → Kopyala (örnek: `https://xxx.upstash.io`)
   - **REST API Token** → Kopyala (uzun token string)

## Adım 3: Vercel Environment Variables Ekle

### Vercel Dashboard'dan:

1. Projenin **Settings** → **Environment Variables** sekmesine git
2. Şu variable'ları ekle:

```env
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=AUrJ9yAgDJSjXmxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
```

**Önemli:**
- Her iki environment'ı seç: **Production**, **Preview**, **Development**
- **"Save"** butonuna tıkla

### Vercel CLI ile (Alternatif):

```bash
vercel env add KV_REST_API_URL production
# URL'yi yapıştır

vercel env add KV_REST_API_TOKEN production
# Token'ı yapıştır
```

## Adım 4: Local Development (.env.local)

Local'de test etmek için:

```bash
cd apps/web
```

`.env.local` dosyasına ekle:

```env
KV_REST_API_URL=https://xxx.upstash.io
KV_REST_API_TOKEN=AUrJ9yAgDJSjXmxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx=
```

## Adım 5: KV Bağlantısını Test Et

### Otomatik Test:

Proje otomatik olarak KV'ye bağlanacak:
- `KV_REST_API_URL` ve `KV_REST_API_TOKEN` varsa → **Gerçek KV kullanılır**
- Yoksa → **Cookie fallback kullanılır** (çalışır ama ideal değil)

### Manuel Test:

X OAuth bağlantısını test et:
1. Vercel'de deploy et veya local'de `npm run dev` çalıştır
2. "Connect X Account" butonuna tıkla
3. X'de authorize ol
4. Console logları kontrol et:
   - ✅ `PKCE verifier stored in KV` → KV çalışıyor
   - ⚠️ `PKCE verifier encrypted and stored in cookie` → Cookie fallback (KV yok)

## Adım 6: KV Durumunu Kontrol Et

### Kod Otomatik Kontrol Eder:

`apps/web/lib/kv.ts` dosyası:
- Production'da: KV varsa kullanır, yoksa cookie fallback
- Development'da: Mock mode (local için)

### Vercel Dashboard'dan:

1. **Storage** → **KV database**'e git
2. **"Data"** tab'ına bak
3. X OAuth testinden sonra `x_oauth_verifier:*` key'lerini görebilirsin
4. 10 dakika sonra otomatik silinir (TTL)

## ⚠️ Sorun Giderme

### KV Bağlantı Hatası:

**Hata:** `Failed to connect to KV, using mock mode`

**Çözüm:**
1. `KV_REST_API_URL` doğru mu kontrol et
2. `KV_REST_API_TOKEN` doğru mu kontrol et
3. Vercel'de environment variable'lar doğru environment'ta mı? (Production/Preview/Development)
4. KV database aktif mi? (Vercel Dashboard'da kontrol et)

### Cookie Fallback Kullanılıyor:

**Log:** `⚠️ KV not available - will use encrypted cookie as fallback`

**Neden:**
- `KV_REST_API_URL` veya `KV_REST_API_TOKEN` eksik/yanlış
- Vercel'de environment variable eklenmemiş

**Çözüm:**
- Vercel Dashboard → Settings → Environment Variables kontrol et
- Local'de `.env.local` dosyasını kontrol et

### Rate Limit Hataları:

**Hata:** `429 Too Many Requests`

**Çözüm:**
- Vercel KV ücretsiz tier: 10,000 komut/gün
- Rate limit ayarlarını kontrol et (`apps/web/lib/kv.ts`)

## ✅ Başarı Kriterleri

KV düzgün çalışıyorsa:
- ✅ X OAuth bağlantısı başarılı
- ✅ Console'da `PKCE verifier stored in KV` logu görünür
- ✅ Vercel Dashboard'da KV database'de key'ler görünür
- ✅ Cookie fallback kullanılmaz

## 📊 KV Kullanım Durumu

KV şu durumlarda kullanılır:
1. **X OAuth PKCE:** `code_verifier` saklama (10 dakika TTL)
2. **Rate Limiting:** API isteklerini sınırlama
3. **Lock Mechanism:** Aynı anda 2 işlem engelleme

**Not:** KV olmadan da çalışır (cookie fallback), ama KV önerilir.

---

**KV kurulumu tamamlandı mı? Test etmek için X OAuth bağlantısını dene!** 🚀

