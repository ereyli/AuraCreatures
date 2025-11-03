# 🔧 "Missing authorization code" Hatası - Çözüm

## ❌ Hata
```
Missing authorization code
```

Bu hata, X OAuth callback endpoint'ine `code` parametresi gelmediğinde oluşur.

---

## 🔍 Nedenleri

### 1. Callback URI Uyumsuzluğu (EN YAYGIN)

**Sorun:** X Developer Portal'daki Callback URI ile kodda kullanılan URI eşleşmiyor.

**Kontrol:**
1. **X Developer Portal:**
   - Settings → User authentication settings → Callback URI
   - Örnek: `https://aura-creatures.vercel.app/api/auth/x/callback`

2. **Vercel Environment Variable:**
   - `X_CALLBACK_URL` değeri
   - TAM olarak eşleşmeli!

**Çözüm:**
- Her iki yerdeki URL'yi karşılaştır
- Birebir aynı olmalı (büyük/küçük harf duyarlı!)

---

### 2. Kullanıcı İzin Vermedi

**Sorun:** Kullanıcı X'de "Authorize app" butonuna tıklamadı veya "Cancel" yaptı.

**Belirtiler:**
- URL'de `error=access_denied` parametresi var
- Callback URL'e sadece `error` parametresi geliyor, `code` yok

**Çözüm:**
- Kullanıcıdan tekrar denemesini iste
- X'de login olduğundan emin ol

---

### 3. Callback URL Doğrudan Erişim

**Sorun:** Kullanıcı callback URL'ye doğrudan gitmiş (OAuth flow olmadan).

**Belirtiler:**
- URL'de hiç parametre yok
- Veya sadece `?` var

**Çözüm:**
- OAuth flow'u baştan başlat
- "Connect X" butonuna tıkla

---

### 4. State Parametresi Eksik/Kayboldu

**Sorun:** OAuth state parametresi kaybolmuş olabilir.

**Çözüm:**
- OAuth flow'u tekrar başlat
- Tarayıcı cache'ini temizle

---

## 🛠️ Debug Adımları

### Adım 1: Vercel Logs Kontrol Et

1. Vercel Dashboard → **Deployments** → En son deployment
2. **Functions** → `/api/auth/x/callback`
3. Log'lara bak:
   ```
   🔍 X OAuth Callback Debug:
   - url: ...
   - hasCode: false
   - hasError: ...
   - allParams: {...}
   ```

**Ne aramalı:**
- `hasCode: false` → Code gelmiyor
- `hasError: true` → X'den error parametresi geliyor
- `error: "access_denied"` → Kullanıcı izin vermedi
- `error: "invalid_request"` → Callback URI uyumsuz

---

### Adım 2: Callback URL'i Kontrol Et

1. X Developer Portal → Settings → User authentication settings
2. **Callback URI** değerini kopyala
3. Vercel → Environment Variables → `X_CALLBACK_URL`
4. **Karşılaştır:**
   - TAM olarak aynı mı?
   - Sonunda `/` var mı? (olmamalı)
   - `http://` mi `https://` mi? (https olmalı)

---

### Adım 3: Browser Console Kontrol Et

1. Browser'da F12 → Console
2. "Connect X" butonuna tıkla
3. Authorization URL'e bak:
   ```
   https://twitter.com/i/oauth2/authorize?response_type=code&client_id=...&redirect_uri=...
   ```
4. `redirect_uri` parametresini decode et
5. X Portal'daki Callback URI ile karşılaştır

**Eşleşmiyor mu?** → Vercel `X_CALLBACK_URL` yanlış!

---

### Adım 4: X Developer Portal Analytics

1. X Developer Portal → **Analytics** → **User authentication**
2. Hataları kontrol et:
   - "Invalid redirect_uri" → Callback URI yanlış
   - "Invalid client" → Client ID/Secret yanlış
   - "Access denied" → Kullanıcı izin vermedi

---

## ✅ Çözüm Checklist

- [ ] X Portal'daki **Callback URI** doğru mu?
- [ ] Vercel'deki **X_CALLBACK_URL** eşleşiyor mu?
- [ ] Her iki URL'de de `https://` var mı?
- [ ] Sonunda `/` yok mu?
- [ ] Path tam mı? (`/api/auth/x/callback`)
- [ ] Kullanıcı X'de login oldu mu?
- [ ] Kullanıcı "Authorize app" butonuna tıkladı mı?
- [ ] Vercel'de redeploy yapıldı mı?

---

## 🎯 Hızlı Test

1. **Callback URL'i test et:**
   ```
   https://aura-creatures.vercel.app/api/auth/x/callback
   ```
   
   Doğrudan bu URL'e git. Eğer "Missing authorization code" hatası alıyorsan → Normal (OAuth flow olmadan geliyorsun).

2. **OAuth flow'u test et:**
   - Ana sayfaya git
   - "Connect X" butonuna tıkla
   - X'de login ol
   - "Authorize app" butonuna tıkla
   - ✅ Redirect olmalı ve profil bilgileri gelmeli

---

## 🐛 Yaygın Hatalar

### ❌ Hata 1: Callback URI Sonunda `/` Var
```
❌ https://aura-creatures.vercel.app/api/auth/x/callback/
✅ https://aura-creatures.vercel.app/api/auth/x/callback
```

### ❌ Hata 2: http:// Kullanılmış
```
❌ http://aura-creatures.vercel.app/api/auth/x/callback
✅ https://aura-creatures.vercel.app/api/auth/x/callback
```

### ❌ Hata 3: Path Eksik
```
❌ https://aura-creatures.vercel.app/
✅ https://aura-creatures.vercel.app/api/auth/x/callback
```

### ❌ Hata 4: Preview URL Kullanılıyor
```
❌ https://aura-creatures-git-main-xxx.vercel.app/api/auth/x/callback
✅ https://aura-creatures.vercel.app/api/auth/x/callback
```

**Not:** Preview URL'ler her deployment'da değişir. Production URL veya custom domain kullan!

---

## 💡 İleri Düzey Debug

### Vercel Function Logs

```bash
# Vercel Dashboard → Deployments → Functions → View Logs
```

Şunları ara:
- `🔍 X OAuth Callback Debug`
- `❌ Missing authorization code`
- `❌ X OAuth error received`

---

## ✅ Başarılı OAuth Flow

1. Kullanıcı "Connect X" butonuna tıklar
2. `/api/auth/x/authorize` çağrılır
3. Authorization URL oluşturulur
4. X'e redirect olur
5. Kullanıcı login olur
6. "Authorize app" butonuna tıklar
7. X, callback URL'e `code` parametresiyle redirect eder
8. `/api/auth/x/callback` çağrılır
9. Code token'a exchange edilir
10. Kullanıcı bilgileri alınır
11. Ana sayfaya redirect olur

---

**Başarılar! 🚀**

