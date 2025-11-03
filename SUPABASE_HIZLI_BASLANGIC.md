# ⚡ Supabase KV Hızlı Başlangıç - 10 Dakikada Kurulum

## 🎯 Hızlı Adımlar

### 1. Supabase Proje Oluştur
1. https://supabase.com → **Sign up** (GitHub ile)
2. **New Project** → İsim: `aura-creatures`
3. **Database Password** oluştur (kaydet!)
4. **Region** seç → **Create**

### 2. Connection String Al
1. **Settings** → **Database** → **Connection string**
2. **URI** tab'ını seç
3. Connection string kopyala
4. `[YOUR-PASSWORD]` kısmını şifren ile değiştir

### 3. Migration Çalıştır
```bash
cd apps/web
```

`.env.local` ekle:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Migration:
```bash
npm run migrate
```

### 4. Vercel Environment Variable
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. `DATABASE_URL` = Supabase connection string
3. **Production, Preview, Development** seç
4. **Save**

### 5. Test Et
1. Redeploy veya `npm run dev`
2. Console'da: `✅ Supabase KV (PostgreSQL) connected successfully`
3. X OAuth dene → Başarılı olmalı!

## ✅ Başarı Kontrolü

- ✅ Console: `✅ Supabase KV connected`
- ✅ Console: `✅ PKCE verifier stored in KV`
- ✅ Supabase Dashboard → Table Editor → `kv_store` tablosunda key'ler var
- ❌ **YOKSA:** Mock KV kullanılıyor (DATABASE_URL kontrol et)

## 🆘 Sorun mu var?

- Migration çalıştırdın mı? (`npm run migrate`)
- `DATABASE_URL` doğru mu? (password'ü kontrol et)
- Supabase projesi aktif mi?
- `kv_store` tablosu var mı? (Supabase → Table Editor)

**Detaylı kurulum:** `SUPABASE_KV_KURULUM.md` dosyasına bak

