# Servisler Nedir? Basit Açıklama

## 🗄️ Vercel Postgres

**Ne işe yarar?**
- Kullanıcı bilgilerini saklar (X kullanıcısı, wallet adresi)
- NFT verilerini saklar (token URI, metadata, traits)
- Kimin ne zaman mint ettiğini kaydeder

**Neden gerekli?**
- Frontend/Backend yeniden başladığında veriler kaybolmasın
- Aynı X kullanıcısı tekrar mint etmesin
- NFT verileri kalıcı olsun

**Alternatif:** MongoDB, Supabase, PlanetScale

**Maliyet:** Vercel'de ücretsiz tier var (256 MB)

---

## 🚀 Vercel KV (Redis)

**Ne işe yarar?**
- **Rate limiting**: Aynı kullanıcı çok fazla istek atamasın
- **Caching**: Sık kullanılan veriler hızlı yüklensin
- **Lock mekanizması**: Aynı anda 2 NFT üretilmesin

**Neden gerekli?**
- Spam/kötüye kullanımı engeller
- API overload'u önler
- Sistem kararlı kalır

**Alternatif:** Upstash Redis, Redis Cloud

**Maliyet:** Vercel'de ücretsiz tier var (10,000 komut/gün)

---

## 📦 IPFS (Pinata / Web3.Storage)

**Ne işe yarar?**
- NFT görsellerini **decentralized** saklar
- NFT metadata'larını kalıcı tutar
- Blockchain'deki URI'lar IPFS'e işaret eder

**Neden gerekli?**
- Web sunucusu kapansa bile görseller kalır
- "ipfs://" linkleri her zaman erişilebilir
- NFT standartlara uygun olsun

**Alternatif:** Arweave, Filecoin

**Maliyet:**
- Pinata: 1 GB ücretsiz/ay
- Web3.Storage: 5 GB ücretsiz/ay

---

## 🐦 X (Twitter) OAuth

**Ne işe yarar?**
- Kullanıcının X hesabına bağlanır
- Profil fotoğrafını ve bilgilerini alır
- Gerçek X kullanıcısı olduğunu doğrular

**Neden gerekli?**
- Herkes 1 NFT alsın (spam önlensin)
- X profil verilerine göre NFT üretilsin
- Social proof olsun

**Alternatif:** Discord OAuth, Google OAuth

**Maliyet:** Ücretsiz (X Developer hesabı gerekli)

---

## 💳 x402 Payment Protocol

**Ne işe yarar?**
- NFT mint için USDC ödeme alır
- Wallet bağlantısı olmadan ödeme
- Güvenli ve decentralize ödeme

**Neden gerekli?**
- Mint ücretli olsun
- Ödemeler güvenli olsun
- Blockchain'de kayıtlı olsun

**Alternatif:** Stripe, PayPal (merkezi seçenekler)

**Maliyet:** Ücretsiz (protokol kendi ücretini alır)

---

## 📊 Proje İçin Gereklilik Sırası

### ⚠️ Kritik (olmazsa çalışmaz):
1. **Vercel Postgres** - Token verileri tutulacak
2. **Vercel KV** - Rate limit/kesinlik önlenecek
3. **Pinata/Web3.Storage** - Görseller decentralized saklanacak

### 🔐 Önemli (olmasa da çalışır):
4. **X OAuth** - Test mode'da atlanabilir ama production için gerekli

### 💰 Opsiyonel:
5. **x402** - Mock'ta test edebiliriz, production'da gerekli

---

## 🎯 Senaryo

**Kullanıcı NFT oluşturduğunda:**

```
1. X ile giriş yap ➜ Vercel Postgres'e kaydedilir
2. "Generate" tıklayınca ➜ Vercel KV rate limit kontrol eder
3. AI görsel üretilir ➜ Pinata'ya yüklenir, Postgres'e kaydedilir
4. "Mint" tıklayınca ➜ Blockchain'e yazılır, Postgres'te token_id güncellenir
```

**Her adımda database'e yazılır, böylece tekrar üretilmez.**

---

## 💡 Özet

| Servis | Ne işe yarar | Gerekli mi? |
|--------|--------------|-------------|
| Vercel Postgres | Kalıcı veri saklar | ✅ Kritik |
| Vercel KV | Rate limit/kilit | ✅ Kritik |
| IPFS | Görsel saklar | ✅ Kritik |
| X OAuth | Kullanıcı doğrulama | ⚠️ Önemli |
| x402 | Ödeme alır | 💰 Opsiyonel |

**Öneri:** Önce Postgres, KV ve IPFS'i kur. Sonra X OAuth ve x402'i ekle.

---

**Anlaşıldı mı? Hangi servisi kurmak istersin?** 🚀

