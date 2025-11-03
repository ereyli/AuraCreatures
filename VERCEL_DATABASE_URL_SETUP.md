# Vercel DATABASE_URL Setup - Kritik!

## Sorun

Log'larda görünen hata:
```
❌ Supabase KV connection error - DATABASE_URL may be wrong or Supabase is down: {
  code: 'ENOTFOUND',
  hostname: 'db.vzhclqjrqhhpyicaktpv.supabase.co',
  message: 'getaddrinfo ENOTFOUND db.vzhclqjrqhhpyicaktpv.supabase.co',
  note: 'Check Vercel environment variables - DATABASE_URL should be set'
}
```

## Çözüm: Vercel'de DATABASE_URL Ekle

### Adım 1: Vercel Dashboard'a Git

1. https://vercel.com/dashboard adresine git
2. **Aura Creatures** projesini seç

### Adım 2: Environment Variables'a Git

1. Proje sayfasında **Settings** sekmesine tıkla
2. Sol menüden **Environment Variables** seçeneğine tıkla

### Adım 3: DATABASE_URL Ekle

1. **Add New** butonuna tıkla
2. Şu değerleri gir:
   - **Key (Name):** `DATABASE_URL`
   - **Value:** `postgresql://postgres:Melikeb5_7495@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres`
   - **Environment:** **Tüm üçünü seç:**
     - ☑️ Production
     - ☑️ Preview  
     - ☑️ Development

3. **Save** butonuna tıkla

### Adım 4: Redeploy

1. Vercel otomatik redeploy yapabilir
2. Veya manuel olarak:
   - **Deployments** sekmesine git
   - En son deployment'ın yanındaki **⋯** menüsüne tıkla
   - **Redeploy** seçeneğini tıkla

## Doğrulama

Redeploy sonrası Vercel logs'da şunu görmelisin:

```
✅ Supabase KV (PostgreSQL) will be used
✅ PKCE verifier stored in KV for state: ...
✅ PKCE verifier retrieved from KV
```

**ENOTFOUND** hatası artık görünmemeli.

## Not

- Connection string formatı: `postgresql://user:password@host:port/database`
- Supabase connection string'i Supabase Dashboard → Settings → Database → Connection string'den alabilirsin
- Connection string'de **password** kısmı senin Supabase database şifren

## Alternatif: Connection Pooler Kullan

Eğer doğrudan bağlantı çalışmıyorsa, Supabase'in Connection Pooler'ını kullan:

1. Supabase Dashboard → Settings → Database
2. **Connection Pooling** bölümünden **Connection string (Session mode)** veya **Connection string (Transaction mode)** kopyala
3. Bu string genelde `pooler.supabase.com:6543` veya benzeri bir port kullanır

Örnek:
```
postgresql://postgres.vzhclqjrqhhpyicaktpv:Melikeb5_7495@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Sorun Devam Ederse

1. Supabase Dashboard'da projenin **active** olduğundan emin ol
2. Database password'un doğru olduğundan emin ol
3. Supabase projenin **paused** olmadığından emin ol
4. Connection string'i Supabase Dashboard'dan **yeniden kopyala**

