# 🔐 SERVER_SIGNER_PRIVATE_KEY Kurulumu

## Sorun

Mint sırasında `SERVER_SIGNER_PRIVATE_KEY not configured` hatası alıyorsun.

## Çözüm: Vercel'e Private Key Ekle

### Adım 1: Yeni Wallet Oluştur (Veya Mevcut Kullan)

Production için **yeni bir wallet** oluşturman önerilir:

1. MetaMask'i aç
2. Yeni hesap oluştur
3. Private key'i export et (**ÇOK GÜVENLİ TUT!**)
4. Wallet address'ini not al

**VEYA** mevcut wallet'in private key'ini kullan (sadece test için)

### Adım 2: Base Sepolia'ya ETH Gönder

Server wallet'e **sadece gas için** biraz ETH gönder:

1. Ana wallet'inden server wallet'e ETH gönder
2. Network: Base Sepolia
3. Miktar: 0.01-0.05 ETH yeterli (gas için)

### Adım 3: Vercel'e Ekle

1. Vercel Dashboard → **Settings** → **Environment Variables**
2. **Add New** butonuna tıkla
3. Şu bilgileri gir:

```
Key: SERVER_SIGNER_PRIVATE_KEY
Value: 0x... (private key'in - 0x ile başlamalı)
Environment: Production ✅, Preview ✅, Development ✅
```

**ÖRNEK:**
```
SERVER_SIGNER_PRIVATE_KEY=0xabcd1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd
```

### Adım 4: Redeploy

Deployment'ı redeploy et:

1. Vercel Dashboard → **Deployments**
2. En son deployment'ın yanındaki **⋯** → **Redeploy**
3. Bekle (1-2 dakika)

## Güvenlik Uyarıları

⚠️ **ÖNEMLİ:**
- Bu private key'i **ASLA** public olarak paylaşma
- GitHub'a **ASLA** commit etme
- Sadece Vercel environment variables'da tut
- Bu wallet'e **sadece gas için** ETH gönder
- Production için ayrı wallet oluştur (test wallet'i kullanma)

## Hızlı Test

Redeploy sonrası:

1. Site'yi aç
2. X bağla
3. Generate et
4. Mint dene
5. Artık hata almamalısın

## Aynı Wallet'i Başka Yerde Kullanıyor musun?

Eğer bu private key başka bir yerde kullanılıyorsa, **yeni bir wallet oluşturman önerilir:**

1. Ayrı bir "server signing wallet" oluştur
2. Bu wallet sadece mint permit signing için
3. Ana wallet'inden farklı tut

---

**Sorun devam ederse:** Vercel logs'u kontrol et ve `SERVER_SIGNER_PRIVATE_KEY` doğru yüklendiğinden emin ol.

