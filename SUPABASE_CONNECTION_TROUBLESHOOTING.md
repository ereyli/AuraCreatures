# Supabase Connection Troubleshooting - ENOTFOUND Hatası

## Sorun

```
getaddrinfo ENOTFOUND db.vzhclqjrqhhpyicaktpv.supabase.co
```

Bu hata, Vercel'in Supabase database'e DNS çözümlemesi yapamadığı anlamına geliyor.

## Olası Nedenler ve Çözümler

### 1. DATABASE_URL Formatı Yanlış

**Kontrol:**
- Vercel Dashboard → Settings → Environment Variables
- `DATABASE_URL` variable'ına tıkla
- Değer şu formatta olmalı:

```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**Örnek doğru format:**
```
postgresql://postgres:Melikeb5_7495@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres
```

### 2. Connection Pooler Kullan (Önerilen)

Supabase, doğrudan bağlantı yerine **Connection Pooler** kullanmanı önerir. Bu özellikle Vercel gibi serverless ortamlar için daha güvenilir.

**Connection Pooler String Al:**

1. Supabase Dashboard → Settings → Database
2. **Connection Pooling** bölümünü bul
3. **Connection string (Transaction mode)** veya **Connection string (Session mode)** kopyala
4. Format şöyle olacak:

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

**Örnek:**
```
postgresql://postgres.vzhclqjrqhhpyicaktpv:Melikeb5_7495@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

**Farklar:**
- Port: `5432` → `6543` (pooler)
- Host: `db.[PROJECT].supabase.co` → `aws-0-[REGION].pooler.supabase.com`
- Username: `postgres` → `postgres.[PROJECT-REF]`

### 3. Supabase Projesi Aktif mi?

1. Supabase Dashboard → Proje seç
2. Sol üstte **proje durumunu** kontrol et
3. **Paused** görünüyorsa, **Resume** butonuna tıkla
4. Eğer pause edilmişse, birkaç dakika bekle (aktif olması gerekir)

### 4. Database Şifresini Reset Et

Şifreyi unuttuysan veya yanlış girildiyse:

1. Supabase Dashboard → Settings → Database
2. **Database password** bölümünü bul
3. **"Reset database password"** butonuna tıkla
4. Yeni şifre belirle (güçlü bir şifre seç!)
5. Yeni şifreyle connection string oluştur
6. Vercel'de `DATABASE_URL`'i güncelle

### 5. Vercel Redeploy Yap

Environment variable değişikliklerinden sonra **MUTLAKA redeploy yap:**

1. Vercel Dashboard → Deployments
2. En son deployment'ın yanındaki **⋯** → **Redeploy**
3. Redeploy tamamlanana kadar bekle (1-2 dakika)

## Hızlı Test: Connection Pooler ile

**Adım 1:** Supabase Dashboard → Settings → Database → Connection Pooling

**Adım 2:** Connection string (Transaction mode) kopyala

**Adım 3:** Vercel → Settings → Environment Variables → DATABASE_URL güncelle

**Adım 4:** Redeploy yap

**Adım 5:** Logs kontrol et - artık `ENOTFOUND` hatası görünmemeli

## Vercel Environment Variables Doğrulama

Vercel'de DATABASE_URL'in doğru eklenmiş olduğundan emin ol:

1. **Settings → Environment Variables**
2. `DATABASE_URL` variable'ını bul
3. **Environment** sütununda **Production, Preview, Development** seçili olmalı
4. **Value** doğru formatta olmalı

## Alternative: Supabase Project URL Kontrolü

Kullanıcının sorusu: "Supabase project URL mi eklememiz gerekiyor?"

**Cevap:** Hayır! Supabase için sadece `DATABASE_URL` yeterli. Project URL (`https://[PROJECT].supabase.co`) sadece Supabase client SDK için kullanılır, database connection için gerekmez.

**Biz PostgreSQL connection string kullanıyoruz:**
- Format: `postgresql://user:password@host:port/database`
- Bu, Postgres'in native connection formatı
- Project URL'e gerek yok

## Son Kontrol Listesi

- [ ] Supabase projesi **active** (paused değil)
- [ ] DATABASE_URL formatı doğru (`postgresql://...`)
- [ ] Connection Pooler kullanıyorsun (önerilen)
- [ ] Password doğru (veya reset edildi)
- [ ] Vercel'de DATABASE_URL **tüm environment'larda** set edildi (Production, Preview, Development)
- [ ] Vercel'de **redeploy yapıldı**
- [ ] Vercel logs'da `ENOTFOUND` hatası görünmüyor

## Hala Çalışmıyorsa

1. Supabase Dashboard → Settings → Database → **Connection string** yeniden kopyala
2. Vercel'de DATABASE_URL'i **tamamen sil ve yeniden ekle**
3. **Connection Pooler** kullan (Transaction mode)
4. Redeploy yap
5. Vercel logs kontrol et

