# 🔍 X OAuth Debug Kullanımı

## ✅ Yeni Özellikler

1. **Debug Endpoint:** `/api/auth/x/debug`
2. **Debug Butonu:** Frontend'de 🔍 butonu
3. **Gelişmiş Hata Mesajları**

---

## 🎯 Nasıl Kullanılır

### Yöntem 1: Frontend Debug Butonu

1. Ana sayfaya git: `https://aura-creatures.vercel.app`
2. "Connect" adımında
3. **🔍 butonuna tıkla** (Connect X butonunun yanında)
4. Konfigürasyon durumunu gör

**Göreceğin bilgiler:**
- ✅/❌ Client ID durumu
- ✅/❌ Client Secret durumu
- ✅/❌ Callback URL durumu
- Callback URL değeri
- Callback Path
- Sorunlar listesi
- Öneriler

---

### Yöntem 2: Debug Endpoint (Direkt)

Tarayıcıda veya curl ile:

```bash
curl https://aura-creatures.vercel.app/api/auth/x/debug
```

Veya tarayıcıda:
```
https://aura-creatures.vercel.app/api/auth/x/debug
```

---

## 📊 Örnek Response

```json
{
  "status": "✅ Configured",
  "config": {
    "hasClientId": true,
    "hasClientSecret": true,
    "hasCallbackUrl": true,
    "callbackUrl": "https://aura-creatures.vercel.app/api/auth/x/callback",
    "callbackPath": "/api/auth/x/callback",
    "callbackHost": "aura-creatures.vercel.app",
    "clientIdPrefix": "V3ZwTW1ieG..."
  },
  "issues": [],
  "recommendations": [
    "1. Check X Developer Portal → Settings → User authentication settings",
    "2. Verify Callback URI matches EXACTLY: https://aura-creatures.vercel.app/api/auth/x/callback",
    "3. Ensure App permissions is set to 'Read'",
    "4. Ensure Type of App is 'Web App, Automated App or Bot'",
    "5. Ensure OAuth 2.0 is enabled",
    "6. After changes, wait 1-2 minutes for X to propagate settings"
  ],
  "testUrl": "https://twitter.com/i/oauth2/authorize?..."
}
```

---

## 🔧 Sorun Giderme

### Sorun 1: "❌ Configuration Issues"

**Çözüm:**
1. Debug butonuna tıkla
2. "Sorunlar" listesini kontrol et
3. Her sorunu tek tek düzelt

### Sorun 2: Callback Path Yanlış

```
⚠️ Callback path should be "/api/auth/x/callback" but got "/callback"
```

**Çözüm:**
- Vercel'de `X_CALLBACK_URL` environment variable'ını düzelt
- Tam URL olmalı: `https://aura-creatures.vercel.app/api/auth/x/callback`

### Sorun 3: https:// Eksik

```
⚠️ X_CALLBACK_URL should start with https://
```

**Çözüm:**
- Vercel'de `X_CALLBACK_URL` değerini düzelt
- `http://` yerine `https://` kullan

---

## 🎯 Test Adımları

1. **Debug butonuna tıkla** → Konfigürasyon durumunu kontrol et
2. **Sorun varsa** → Düzelt
3. **Vercel'de redeploy yap** (environment variable değiştirdiysen)
4. **1-2 dakika bekle** (X ayarları propagate olması için)
5. **"Connect X Account" butonuna tıkla**
6. **X'de login ol** → "Authorize app" → ✅ Başarılı!

---

## 📝 Önemli Notlar

- Environment variable değiştirdikten sonra **redeploy yap!**
- X Developer Portal'da değişiklik yaptıktan sonra **1-2 dakika bekle**
- Callback URL'ler **TAM olarak eşleşmeli** (büyük/küçük harf duyarlı)
- Debug endpoint production'da da çalışıyor (güvenlik için sadece konfigürasyon bilgisi gösteriyor)

---

**Başarılar! 🚀**

