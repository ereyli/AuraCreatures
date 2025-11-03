# 🔧 X OAuth Hatası - "Uygulamaya erişim verilemedi"

## ❌ Hata
```
"Uygulamaya erişim verilemedi. Geri dönüp tekrar giriş yapmayı dene."
```

Bu hata genellikle **X Developer Portal ayarları** ile **kod arasındaki uyumsuzluktan** kaynaklanır.

---

## 🔍 Kontrol Listesi

### 1️⃣ Callback URI Eşleşmesi

**✅ X Developer Portal'da:**
- Settings → User authentication settings → Callback URI / Redirect URL
- **Tam URL olmalı:** `https://aura-creatures.vercel.app/api/auth/x/callback`
- **VEYA local test için:** `http://localhost:3000/api/auth/x/callback`

**✅ Vercel Environment Variable'da:**
- `X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback`
- **Not:** Tam URL, sonunda `/` olmadan!

**❌ Yaygın Hatalar:**
- ❌ `http://aura-creatures.vercel.app/api/auth/x/callback` (http değil, https olmalı)
- ❌ `https://aura-creatures.vercel.app/api/auth/x/callback/` (sonunda `/` olmamalı)
- ❌ `https://aura-creatures.vercel.app/` (eksik path)
- ❌ `https://your-project.vercel.app/api/auth/x/callback` (proje adı yanlış)

---

### 2️⃣ App Type

**✅ X Developer Portal'da:**
- Settings → App info → Type of App
- **"Web App, Automated App or Bot"** seçili olmalı
- ❌ **"Native App"** değil!

---

### 3️⃣ App Permissions

**✅ X Developer Portal'da:**
- Settings → User authentication settings → App permissions
- **"Read"** seçili olmalı
- ❌ "Read and write" değil (henüz gerekmez)

---

### 4️⃣ OAuth 2.0 Settings

**✅ X Developer Portal'da:**
- Settings → User authentication settings
- **OAuth 2.0** enabled olmalı
- **Client ID** ve **Client Secret** doğru kopyalanmış olmalı

---

### 5️⃣ Vercel Environment Variables

**✅ Vercel Dashboard'da kontrol et:**

```bash
X_CLIENT_ID=your_client_id_here
X_CLIENT_SECRET=your_client_secret_here
X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback
```

**⚠️ Önemli:**
- `X_CALLBACK_URL` Vercel deployment URL'inle eşleşmeli
- Production URL kullanıyorsan: `https://aura-creatures.vercel.app/...`
- Preview URL kullanıyorsan: `https://aura-creatures-git-main-xxx.vercel.app/...`

---

## 🛠️ Adım Adım Düzeltme

### Adım 1: X Developer Portal'ı Kontrol Et

1. https://developer.twitter.com/en/portal/dashboard
2. **Projen'i seç**
3. **Settings** → **User authentication settings**
4. **Şunları kontrol et:**

   **a) Callback URI / Redirect URL:**
   ```
   https://aura-creatures.vercel.app/api/auth/x/callback
   ```
   - ✅ Tam URL, https ile
   - ✅ Sonunda `/` yok
   - ✅ Path tam: `/api/auth/x/callback`

   **b) App permissions:**
   - ✅ "Read" seçili

   **c) Type of App:**
   - ✅ "Web App, Automated App or Bot"

   **d) OAuth 2.0:**
   - ✅ Enabled

5. **"Save"** yap

---

### Adım 2: Vercel Environment Variables Kontrol Et

1. https://vercel.com/dashboard
2. **Projen** → **Settings** → **Environment Variables**
3. **Şunları kontrol et:**

   ```bash
   X_CLIENT_ID=... (X Portal'dan kopyaladığın)
   X_CLIENT_SECRET=... (X Portal'dan kopyaladığın)
   X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback
   ```

4. **Callback URL'in doğru mu?**
   - Vercel deployment URL'in nedir?
   - Production URL: `https://aura-creatures.vercel.app` → callback: `/api/auth/x/callback`
   - Preview URL değişir, her deployment'da farklı!

**⚠️ Preview URL kullanıyorsan:**
- Her deployment'da yeni URL olur
- Production URL kullan veya custom domain ekle

---

### Adım 3: Redeploy

1. Environment variables değiştirdiysen
2. **Deployments** → **Redeploy**

---

### Adım 4: Test

1. Production URL'e git: `https://aura-creatures.vercel.app`
2. "Connect X" butonuna tıkla
3. X login ekranı açılmalı
4. Login yap
5. **"Authorize app"** butonuna tıkla
6. ✅ Redirect olmalı ve profil bilgileri gelmeli

---

## 🐛 Hata Devam Ederse

### Debug: Callback URL'i Kontrol Et

1. Browser console'u aç (F12)
2. "Connect X" butonuna tıkla
3. URL'e bak:
   ```
   https://twitter.com/i/oauth2/authorize?response_type=code&client_id=...&redirect_uri=...
   ```
4. `redirect_uri` parametresini decode et:
   - URL'yi kopyala
   - `redirect_uri=` sonrasını al
   - Decode et
   - X Portal'daki callback URI ile karşılaştır

**Eşleşmiyor mu?** → Vercel `X_CALLBACK_URL` environment variable'ı yanlış!

---

### Debug: X Developer Portal Logs

1. X Developer Portal → **Analytics** → **User authentication**
2. Hataları kontrol et
3. "Invalid redirect_uri" hatası görüyorsan → Callback URI yanlış

---

### Debug: Vercel Logs

1. Vercel Dashboard → **Deployments** → En son deployment → **Functions** → `/api/auth/x/authorize`
2. Log'lara bak:
   - `X_CLIENT_ID` var mı?
   - `X_CALLBACK_URL` doğru mu?

---

## ✅ Doğru Yapılandırma Örneği

### X Developer Portal:
```
App Name: Aura Creatures NFT
Type of App: Web App, Automated App or Bot
App permissions: Read
Callback URI: https://aura-creatures.vercel.app/api/auth/x/callback
OAuth 2.0: ✅ Enabled
```

### Vercel Environment Variables:
```
X_CLIENT_ID=abc123xyz...
X_CLIENT_SECRET=def456uvw...
X_CALLBACK_URL=https://aura-creatures.vercel.app/api/auth/x/callback
```

### Kod (apps/web/app/api/auth/x/authorize/route.ts):
```typescript
const redirectUri = env.X_CALLBACK_URL; // ✅ Vercel'den alınıyor
```

---

## 🎯 Hızlı Çözüm

**En yaygın hata:** Callback URI uyumsuzluğu

1. **X Portal'a git** → Callback URI'yi kontrol et
2. **Vercel'e git** → `X_CALLBACK_URL` environment variable'ı kontrol et
3. **Eşleşmeli!** Tam olarak aynı URL olmalı
4. **Redeploy** yap
5. **Test et**

---

## 📞 Hala Çalışmıyorsa

Şunları gönder:
1. X Portal'daki **Callback URI** (screenshot)
2. Vercel'deki **X_CALLBACK_URL** değeri
3. Browser console'daki **redirect_uri** parametresi
4. Vercel logs'daki hata mesajı

---

**Başarılar! 🚀**

