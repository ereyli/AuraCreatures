# Supabase DATABASE_URL Bulma Rehberi

## Adım Adım: Supabase Connection String Bulma

### Yöntem 1: Supabase Dashboard (Kolay)

1. **Supabase Dashboard'a Git**
   - https://app.supabase.com adresine git
   - Projene login ol

2. **Proje Ayarlarına Git**
   - Sol menüden **Settings** (⚙️) ikonuna tıkla
   - **Project Settings** seçeneğine tıkla

3. **Database Section'ı Bul**
   - Sol menüden **Database** seçeneğine tıkla
   - **Connection string** veya **Connection pooling** bölümünü bul

4. **Connection String'i Kopyala**
   - **URI** tab'ına tıkla
   - Şifre kısmında **"Reveal"** veya **"Show"** butonuna tıkla
   - **"Copy"** butonuna tıklayarak connection string'i kopyala

### Yöntem 2: Database Password'u Reset Et (Unutursan)

Eğer database şifresini unuttuysan veya yanlış girdiğini düşünüyorsan:

1. **Supabase Dashboard → Settings → Database**
2. **Database password** bölümünü bul
3. **"Reset database password"** butonuna tıkla
4. Yeni şifreyi belirle (güçlü bir şifre seç)
5. Yeni şifreyi kaydet (güvenli bir yerde sakla!)
6. Connection string'i yeni şifre ile oluştur

### Connection String Formatı

```
postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

Örnek (senin durumun):
```
postgresql://postgres:Melikeb5_7495@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres
```

**Parçalar:**
- `postgres` = username (her zaman bu)
- `[PASSWORD]` = database şifresi (sen belirledin veya resetledin)
- `[PROJECT_REF]` = projenin benzersiz ID'si
- `5432` = PostgreSQL portu (her zaman bu)
- `postgres` = database adı (her zaman bu)

### Dikkat: Connection Pooling

Eğer doğrudan bağlantı çalışmıyorsa, **Connection Pooling** kullan:

1. **Settings → Database → Connection pooling**
2. **Transaction mode** veya **Session mode** seç
3. Connection string'i kopyala (port `6543` olacak)

Transaction mode örneği:
```
postgresql://postgres.vzhclqjrqhhpyicaktpv:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### Vercel'e Ekleme

1. Vercel Dashboard → Proje → Settings → Environment Variables
2. **Add New** butonuna tıkla
3. Şu bilgileri gir:
   - **Key:** `DATABASE_URL`
   - **Value:** Kopyaladığın connection string
   - **Environment:** Production, Preview, Development (3'ünü de seç)
4. **Save** butonuna tıkla
5. **Redeploy** yap (Deployments → Redeploy)

### Test Etme

Redeploy sonrası Vercel logs'da şunu görmelisin:
```
✅ Supabase KV (PostgreSQL) will be used
✅ PKCE verifier stored in KV for state: ...
```

**ENOTFOUND** hatası artık görünmemeli.

## Sorun Devam Ederse

1. **Şifreni reset et** (yukarıdaki adımlar)
2. **Yeni şifreyle connection string oluştur**
3. **Vercel'de DATABASE_URL'i güncelle**
4. **Redeploy yap**

## Önemli Not

Connection string'de **şifre görünüyor**, bu normal. Şifre sadece database'e erişim için kullanılıyor ve sadece sen görebilirsin. Güvenli bir yerde sakla ama public olarak paylaşma.

