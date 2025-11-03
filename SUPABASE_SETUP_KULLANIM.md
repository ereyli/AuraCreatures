# 🚀 Supabase Setup Wizard - Kullanım Kılavuzu

Artık Supabase'i tek komutla kurabilirsin!

## 🎯 Tek Komutla Kurulum

Terminal'de (`apps/web` klasöründe):

```bash
npm run setup:supabase
```

## 📋 Setup Wizard Adımları

Wizard şunları soracak:

1. **Supabase Project URL**
   - Örnek: `https://vzhclqjrqhhpyicaktpv.supabase.co`
   - Supabase Dashboard → Settings → API → Project URL

2. **Database Password**
   - Supabase Dashboard → Settings → Database → Database password
   - Eğer bilmiyorsan: "Reset database password" butonuna tıklayıp yeni bir tane oluştur

3. **Connection Type**
   - `[1]` Direct connection (5432) - **Önerilen** (development için)
   - `[2]` Connection pooling (6543) - Production için

4. **Migration Çalıştır?**
   - `y` → Otomatik tabloları oluşturur
   - `n` → Sadece connection string ekler, migration'ı sonra çalıştırırsın

## ✅ Örnek Kullanım

```bash
cd apps/web
npm run setup:supabase
```

**Wizard çıktısı:**
```
🚀 Supabase Setup Wizard

✅ Found existing .env.local file

📋 Please provide Supabase connection details:

1. Supabase Project URL (e.g., https://xxxxx.supabase.co): https://vzhclqjrqhhpyicaktpv.supabase.co
   ✓ Project Reference: vzhclqjrqhhpyicaktpv

2. Database Password (from Supabase Settings → Database): ********

3. Connection Type:
   [1] Direct connection (port 5432) - Recommended
   [2] Connection pooling (port 6543) - For production
   Choose (1 or 2, default: 1): 1

✅ Connection string generated!
   postgresql://postgres:****@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres

✅ DATABASE_URL added to .env.local

Run migration now to create tables? (y/n): y

🔄 Running migrations...

Running database migrations...
Database: postgresql://postgres.****@db.vzhclqjrqhhpyicaktpv.supabase.co:5432/postgres
✓ users table created
✓ tokens table created
✓ payments table created
✓ kv_store table created
✓ indexes created

✅ All migrations completed successfully!
```

## 🎯 Şimdi Ne Yapmalısın?

1. **Terminal'de çalıştır:**
   ```bash
   cd apps/web
   npm run setup:supabase
   ```

2. **Wizard'a bilgileri gir:**
   - Project URL'i Supabase Dashboard'dan kopyala
   - Database password'ı gir (veya reset et)

3. **Migration çalıştır (y)** → Tablolar otomatik oluşur!

4. **Supabase Dashboard'dan kontrol et:**
   - Table Editor → Tabloları görmelisin ✅

## ⚠️ Sorun Giderme

### "tsx command not found"

```bash
npm install
```

### "DATABASE_URL already exists"

Wizard sana soracak - `y` deyip güncelle.

### Connection hatası

- Database password doğru mu kontrol et
- Supabase projesi aktif mi kontrol et
- Connection type'ı dene (1 veya 2)

## 🎉 Hazır!

Setup tamamlandıktan sonra:

- ✅ `.env.local`'de `DATABASE_URL` var
- ✅ Supabase'de tablolar oluşturuldu
- ✅ KV storage hazır
- ✅ X OAuth için hazır!

---

**Tek komut: `npm run setup:supabase`** 🚀

