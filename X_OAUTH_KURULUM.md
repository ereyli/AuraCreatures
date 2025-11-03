# 🐦 X (Twitter) OAuth Kurulum Rehberi

## ✅ Durum
- ✅ Proje Vercel'de çalışıyor
- ✅ Ana sayfa açılıyor
- ⏳ X OAuth kurulumu yapılacak

---

## 📋 Adım Adım X OAuth Kurulumu

### 1️⃣ X Developer Hesabı Al

1. **X Developer Portal'a git:**
   - https://developer.twitter.com/en/portal/petition/essential/basic-info
   
2. **"Apply for a developer account"** butonuna tıkla

3. **Formu doldur:**
   - **Account name:** Kendi adın veya proje adı
   - **Account category:** "Hobbyist" veya "Other" seç
   - **Use case description:** Örnek:
     ```
     I'm building an NFT minting application that allows users to connect their X profile to generate personalized AI NFTs. Users will authenticate via OAuth 2.0 to verify their X identity.
     ```
   - **How will you use the Twitter API?**
     - Select: ✅ "Explore the API"
     - Select: ✅ "Build a solution for personal use"
     - Select: ✅ "Build a solution for non-commercial use"
   
4. **Terms'i kabul et** ve **Submit** butonuna tıkla

5. **Onay bekle** (genellikle 1-3 gün sürer)

---

### 2️⃣ OAuth App Oluştur

**Developer hesabın onaylandıktan sonra:**

1. **X Developer Portal'a git:**
   - https://developer.twitter.com/en/portal/dashboard

2. **"Projects & Apps"** sekmesine git

3. **"Create App"** butonuna tıkla

4. **App bilgilerini gir:**
   - **App name:** `Aura Creatures NFT` (veya istediğin isim)
   - **App description:**
     ```
     NFT minting application that generates personalized AI creatures based on X profiles
     ```
   - **Website URL:** `https://aura-creatures.vercel.app`
   - **Callback URLs:** `https://aura-creatures.vercel.app/api/auth/x/callback`
   - **App environment:** `Production`

5. **"Create App"** butonuna tıkla

---

### 3️⃣ OAuth 2.0 Ayarları

1. **Oluşturduğun app'e tıkla**

2. **"Settings"** tab'ına git

3. **"OAuth 2.0 Settings"** bölümünü bul

4. **OAuth 2.0'ı aktif et:**
   - ✅ "Enable OAuth 2.0" checkbox'ını işaretle

5. **Callback URI ekle:**
   - **Production:** `https://aura-creatures.vercel.app/api/auth/x/callback`
   - **Add Callback URL** butonuna tıkla

6. **App permissions:**
   - ✅ "Read users" seç
   - (Optional) ✅ "Read profile" seç

7. **"Save"** butonuna tıkla

---

### 4️⃣ Client ID ve Secret Al

1. **"Keys and Tokens"** tab'ına git

2. **OAuth 2.0 Client ID ve Client Secret:**
   - **OAuth 2.0 Client ID** kopyala
   - **OAuth 2.0 Client Secret** kopyala (kalıcı gösterme seçeneğini aç)

3. **ÖNEMLİ:** Bu bilgileri güvenli bir yerde sakla!

---

### 5️⃣ Vercel Environment Variables Ekle

1. **Vercel Dashboard'a git:**
   - https://vercel.com/dashboard

2. **Proje'yi seç:** `aura-creatures` (veya proje adın)

3. **Settings** → **Environment Variables**

4. **Aşağıdaki değişkenleri ekle:**

#### X OAuth Credentials:
```
X_CLIENT_ID=your_oauth_client_id_here
X_CLIENT_SECRET=your_oauth_client_secret_here
X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback
```

**Not:** `your_oauth_client_id_here` ve `your_oauth_client_secret_here` yerine gerçek değerleri yapıştır!

5. **"Save"** butonuna tıkla

6. **Redeploy yap:**
   - **Deployments** → En son deployment → **"Redeploy"**

---

### 6️⃣ Test Et

1. **Production URL'ini aç:**
   - https://aura-creatures.vercel.app

2. **"Connect X Account"** butonuna tıkla

3. **X OAuth akışı:**
   - X'te giriş yapman istenecek
   - Uygulamaya izin vermen istenecek
   - Callback'e yönlendirileceksin
   - Profil bilgileri alınacak

4. **Başarılı olursa:**
   - Ana sayfada X kullanıcı bilgilerin görünecek
   - "Generate NFT" butonu aktif olacak

---

## 🔐 Güvenlik Notları

- ⚠️ **Client Secret'ı ASLA GitHub'a commit etme!**
- ✅ Environment variables sadece Vercel'de tut
- ✅ Client Secret'ı başkalarıyla paylaşma
- ✅ Düzenli olarak secret'ları rotate et

---

## 🐛 Sorun Giderme

### "Invalid redirect_uri"
- ✅ Callback URL'in X app settings'tekiyle **tamamen aynı** olmalı
- ✅ `https://` ile başlamalı
- ✅ Sonunda `/` olmamalı

### "Unauthorized"
- ✅ Client ID ve Secret doğru mu kontrol et
- ✅ Environment variables Vercel'de kaydedildi mi?
- ✅ Redeploy yaptın mı?

### "Connection failed"
- ✅ X Developer hesabın aktif mi?
- ✅ OAuth 2.0 enabled mi?
- ✅ Browser console'da hata var mı bak

### "Missing authorization code"
- ✅ Callback URL doğru mu?
- ✅ X app settings'te callback URL ekli mi?

---

## 📝 Checklist

- [ ] X Developer hesabı oluşturuldu
- [ ] OAuth app oluşturuldu
- [ ] OAuth 2.0 enabled
- [ ] Callback URL eklendi
- [ ] Client ID kopyalandı
- [ ] Client Secret kopyalandı
- [ ] Vercel'de environment variables eklendi
- [ ] Redeploy yapıldı
- [ ] Test edildi ✅

---

## ✅ Hazır!

X OAuth kurulumu tamamlandıktan sonra, kullanıcılar "Connect X Account" butonuna tıklayarak X hesaplarını bağlayabilirler!

**Sorun olursa haber ver, birlikte çözelim!** 🚀

