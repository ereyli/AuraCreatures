# 🚀 Supabase KV Kurulum Rehberi

KV yerine Supabase PostgreSQL kullanıyoruz. Bu sayede tek bir database ile hem kalıcı verileri hem de geçici KV verilerini saklayabiliyoruz.

## 🎯 Avantajlar

- ✅ Tek database (Supabase) - daha basit yönetim
- ✅ KV yerine PostgreSQL `kv_store` tablosu
- ✅ Vercel KV'ye gerek yok
- ✅ Ücretsiz tier: 500 MB database, 2 GB bandwidth
- ✅ Otomatik TTL (expires_at) ile temizlik

## Adım 1: Supabase Hesabı Oluştur

1. **Supabase**'e git: https://supabase.com
2. **"Start your project"** → **"Sign up"**
3. GitHub ile kaydol
4. **"New Project"** butonuna tıkla

## Adım 2: Supabase Proje Oluştur

1. **Project Name**: `aura-creatures` (veya istediğin isim)
2. **Database Password**: Güçlü bir şifre oluştur (kaydet!)
3. **Region**: En yakın region seç
   - Avrupa: `eu-west-1` (Ireland)
   - ABD: `us-east-1` (N. Virginia)
   - Asya: `ap-southeast-1` (Singapore)
4. **Pricing Plan**: **Free** seç
5. **"Create new project"** butonuna tıkla
6. 2-3 dakika bekle (proje oluşturuluyor)

## Adım 3: Connection String Al

1. Supabase Dashboard → Projeni aç
2. Sol menüden **"Settings"** → **"Database"** sekmesine git
3. **"Connection string"** bölümünü bul
4. **"URI"** tab'ını seç
5. Connection string'i kopyala (format):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

**Önemli:** `[YOUR-PASSWORD]` kısmını proje oluştururken verdiğin şifre ile değiştir!

## Adım 4: Database Migration Çalıştır

Terminal'de:

```bash
cd apps/web
```

`.env.local` dosyasına `DATABASE_URL` ekle (Supabase connection string):

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Migration çalıştır:

```bash
npm run migrate
```

**Beklenen çıktı:**
```
Running database migrations...
✓ users table created
✓ tokens table created
✓ payments table created
✓ kv_store table created
✓ indexes created

✅ All migrations completed successfully!
```

## Adım 5: Vercel Environment Variables

Vercel'de production için:

1. **Vercel Dashboard** → Projeni aç
2. **Settings** → **Environment Variables**
3. `DATABASE_URL` ekle:
   - Value: Supabase connection string (password'ü doğru yaz!)
   - Environment: **Production, Preview, Development**
4. **Save**

## Adım 6: Test Et

### KV Bağlantısını Test Et:

1. Vercel'de redeploy et veya local'de `npm run dev` çalıştır
2. Console loglarında şunu görmelisin:
   ```
   ✅ Supabase KV (PostgreSQL) connected successfully
   ```

### X OAuth ile Test Et:

1. "Connect X Account" butonuna tıkla
2. X'de authorize ol
3. Console loglarında:
   ```
   ✅ PKCE verifier stored in KV for state: ...
   ```
   veya Supabase'de:
   ```
   ✅ PKCE verifier retrieved from KV
   ```

### Supabase Dashboard'dan Kontrol Et:

1. Supabase Dashboard → **Table Editor**
2. `kv_store` tablosuna git
3. X OAuth testinden sonra `x_oauth_verifier:*` key'lerini görebilirsin
4. `expires_at` sütunu TTL'i gösterir

## ⚠️ Sorun Giderme

### Migration Hatası

**Hata:** `❌ Migration failed: connection refused`

**Çözüm:**
1. `DATABASE_URL` doğru mu kontrol et
2. Password doğru mu? (Supabase proje oluştururken verdiğin şifre)
3. Supabase projesi aktif mi? (Dashboard'dan kontrol et)

### KV Bağlantı Hatası

**Hata:** `⚠️ Failed to initialize Supabase KV`

**Çözüm:**
1. Database migration çalıştırdın mı? (`npm run migrate`)
2. `kv_store` tablosu var mı? (Supabase Dashboard → Table Editor)
3. `DATABASE_URL` Vercel'de doğru mu? (Production environment'ta)

### TTL (Expires) Çalışmıyor

**Not:** Expired key'ler otomatik temizlenir. Eğer çalışmıyorsa:
- Manuel temizlik: Supabase Dashboard → SQL Editor → çalıştır:
  ```sql
  DELETE FROM kv_store 
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
  ```

## ✅ Başarı Kriterleri

KV (Supabase) düzgün çalışıyorsa:
- ✅ Console'da `✅ Supabase KV (PostgreSQL) connected successfully`
- ✅ X OAuth bağlantısı başarılı
- ✅ Console'da `✅ PKCE verifier stored in KV`
- ✅ Supabase Dashboard'da `kv_store` tablosunda key'ler görünür
- ✅ Mock KV kullanılmaz (production'da)

## 📊 KV Store Tablosu

| Column | Type | Description |
|--------|------|-------------|
| `key` | VARCHAR(255) | Primary key - unique identifier |
| `value` | TEXT | Stored value |
| `expires_at` | TIMESTAMP | TTL - auto-cleanup tarihi |
| `created_at` | TIMESTAMP | Oluşturulma tarihi |

**Kullanım:**
- PKCE verifier: `x_oauth_verifier:{state}`
- Rate limit: `rate_limit:{user_id}`
- Lock: `lock:{resource}`

## 🔄 Vercel KV'den Supabase'e Geçiş

Eğer daha önce Vercel KV kullanıyorsan:

1. ✅ Supabase kurulumunu tamamla
2. ✅ Migration çalıştır (`kv_store` tablosu oluşur)
3. ❌ Vercel KV environment variable'larını **SİLME** (otomatik ignore edilir)
4. ✅ `DATABASE_URL` Supabase connection string olarak ayarla
5. ✅ Test et

**Not:** Vercel KV credential'ları varsa hala kullanılabilir, ama Supabase tercih edilir.

---

**Supabase KV kurulumu tamamlandı mı? Test etmek için X OAuth bağlantısını dene!** 🚀

