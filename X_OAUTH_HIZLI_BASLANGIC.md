# 🚀 X OAuth App Oluşturma - Hızlı Başlangıç

## ✅ Durum
- ✅ X Developer Portal'a giriş yapıldı
- ✅ Free plan aktif
- ⏳ OAuth app oluşturulacak

---

## 📋 OAuth App Oluşturma Adımları

### 1️⃣ Projects & Apps'a Git

1. Sol menüden **"Projects & Apps"** sekmesine tıkla
2. **"Overview"** sekmesine git (varsayılan açılır)

---

### 2️⃣ Yeni App Oluştur

1. **"Create App"** veya **"+ Add App"** butonuna tıkla

2. **App bilgilerini gir:**
   - **App name:** `Aura Creatures NFT` (veya istediğin isim)
   - **Description:** 
     ```
     NFT minting application that generates personalized AI creatures based on X profiles. Uses OAuth 2.0 for user authentication.
     ```
   - **Website URL:** `https://aura-creatures.vercel.app`
   - **App environment:** `Production` (veya Development)

3. **"Create App"** butonuna tıkla

---

### 3️⃣ OAuth 2.0 Ayarları

1. **Oluşturduğun app'e tıkla**

2. **"Settings"** tab'ına git

3. **OAuth 2.0 Settings** bölümünü bul:
   - **Type of App:** `Web App, Automated App or Bot` seç

4. **Callback URI / Redirect URL ekle:**
   - **Callback URI:** `https://aura-creatures.vercel.app/api/auth/x/callback`
   - **"Add"** butonuna tıkla
   - ⚠️ **ÖNEMLİ:** URL'in tam olarak aynı olması gerekir!

5. **App permissions:**
   - ✅ **Read** seç (kullanıcı bilgilerini okumak için)
   - ❌ Write, Read and Write seçme (sadece profil okumak için)

6. **"Save"** butonuna tıkla

---

### 4️⃣ Client ID ve Secret Al

1. **"Keys and Tokens"** tab'ına git

2. **OAuth 2.0 Client ID ve Client Secret:**
   - **OAuth 2.0 Client ID** → Kopyala (hemen görünür)
   - **OAuth 2.0 Client Secret** → **"Generate"** butonuna tıkla
   - Secret oluşturulduktan sonra **Kopyala**
   - ⚠️ **ÖNEMLİ:** Secret'ı bir daha göremeyeceğin için şimdi kopyala!

---

### 5️⃣ Vercel'e Environment Variables Ekle

1. **Vercel Dashboard'a git:**
   - https://vercel.com/dashboard

2. **Projen'i seç:** `aura-creatures` (veya proje adın)

3. **Settings** → **Environment Variables**

4. **Aşağıdaki 3 değişkeni ekle:**

   ```
   X_CLIENT_ID=paste_your_client_id_here
   ```

   ```
   X_CLIENT_SECRET=paste_your_client_secret_here
   ```

   ```
   X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback
   ```

   **Not:** `paste_your_client_id_here` ve `paste_your_client_secret_here` yerine gerçek değerleri yapıştır!

5. Her değişkeni ekledikten sonra **"Save"** butonuna tıkla

6. **Environment:** Production, Preview, Development seç (hepsini seçebilirsin)

---

### 6️⃣ Redeploy

1. **Deployments** sekmesine git
2. En son deployment'ı bul
3. **"Redeploy"** butonuna tıkla
4. **"Redeploy"** onayla

⏳ Deploy tamamlanmasını bekle (1-2 dakika)

---

### 7️⃣ Test Et

1. **Production URL'ini aç:**
   - https://aura-creatures.vercel.app

2. **"Connect X Account"** butonuna tıkla

3. **X OAuth akışı:**
   - X'e yönlendirileceksin
   - X'te giriş yap (gerekirse)
   - "Authorize App" butonuna tıkla
   - Callback'e döneceksin

4. **Başarılı olursa:**
   - ✅ Ana sayfada X kullanıcı bilgilerin görünecek
   - ✅ Username ve profil fotoğrafı görünecek
   - ✅ "Generate NFT" butonu aktif olacak

---

## 🐛 Yaygın Sorunlar

### ❌ "Invalid redirect_uri"

**Sebep:** Callback URL eşleşmiyor

**Çözüm:**
1. X Developer Portal → App Settings → Callback URI'yi kontrol et
2. Vercel'deki `X_CALLBACK_URL` environment variable'ı kontrol et
3. İkisi de **tam olarak aynı** olmalı:
   - `https://aura-creatures.vercel.app/api/auth/x/callback`
   - Sonunda `/` olmamalı
   - `http://` değil, `https://` olmalı

---

### ❌ "Unauthorized" veya "Client authentication failed"

**Sebep:** Client ID veya Secret yanlış

**Çözüm:**
1. X Developer Portal → Keys and Tokens → Tekrar kopyala
2. Vercel Environment Variables → Güncelle
3. Redeploy yap

---

### ❌ "Connection failed" veya "X OAuth not configured"

**Sebep:** Environment variables yüklenmemiş

**Çözüm:**
1. Vercel'de environment variables eklendi mi kontrol et
2. Redeploy yaptın mı? (Değişkenler sadece yeni deploy'larda yüklenir)
3. Production environment'ı seçtiğinden emin ol

---

### ❌ Button'a tıklayınca hiçbir şey olmuyor

**Sebep:** Frontend'de hata var

**Çözüm:**
1. Browser console'u aç (F12)
2. Hata mesajlarını kontrol et
3. Network tab'ında `/api/auth/x/authorize` request'i var mı bak
4. Response'u kontrol et

---

## ✅ Checklist

- [ ] OAuth app oluşturuldu
- [ ] Callback URI eklendi (tam URL)
- [ ] App permissions: Read seçildi
- [ ] Client ID kopyalandı
- [ ] Client Secret generate edildi ve kopyalandı
- [ ] Vercel'e environment variables eklendi (3 adet)
- [ ] Redeploy yapıldı
- [ ] Test edildi ✅

---

## 🎯 Başarılı!

OAuth app oluşturuldu ve Vercel'e eklendi. Şimdi "Connect X Account" butonu çalışmalı!

**Sorun olursa:**
- Browser console'a bak
- Vercel logs'u kontrol et
- X Developer Portal'da app settings'i kontrol et

**Başarılar! 🚀**

