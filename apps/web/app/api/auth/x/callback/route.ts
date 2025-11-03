import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, verifyXToken } from "@/lib/x";
import { env } from "@/env.mjs";
import { kv } from "@/lib/kv";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  
  // Retrieve PKCE code_verifier from server-side storage (keyed by state)
  let codeVerifier: string | null = null;
  if (state) {
    try {
      // First try KV storage
      const stateKey = `x_oauth_verifier:${state}`;
      const stored = await kv.get(stateKey);
      if (stored) {
        codeVerifier = stored as string;
        // Clean up stored verifier after use
        await kv.del(stateKey);
        console.log("✅ PKCE verifier retrieved from KV");
      } else {
        // Fallback: Try encrypted cookie (used when KV is not available)
        const cookieName = `x_oauth_verifier_${state}`;
        const cookieValue = request.cookies.get(cookieName)?.value;
        
        if (cookieValue) {
          // Parse encrypted verifier from cookie
          const [cookieState, encryptedVerifier] = cookieValue.split(":");
          
          if (cookieState === state && encryptedVerifier) {
            // Decrypt verifier
            const crypto = require("crypto");
            const secretKey = env.X_CLIENT_SECRET?.substring(0, 32) || "fallback_secret_key_12345678";
            const [ivHex, encrypted] = encryptedVerifier.split(":");
            
            if (ivHex && encrypted) {
              const iv = Buffer.from(ivHex, "hex");
              const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(secretKey.padEnd(32, "0")), iv);
              let decrypted = decipher.update(encrypted, "hex", "utf8");
              decrypted += decipher.final("utf8");
              codeVerifier = decrypted;
              
              console.log("✅ PKCE verifier retrieved from encrypted cookie (fallback mode)");
              // Cookie will be cleaned up in the final redirect response
            }
          }
        }
      }
    } catch (error) {
      console.error("⚠️ Failed to retrieve PKCE verifier:", error);
    }
  }
  
  // Debug logging with detailed URL comparison
  const actualUrl = new URL(request.url);
  const expectedCallbackUrl = env.X_CALLBACK_URL ? new URL(env.X_CALLBACK_URL) : null;
  
  console.log("🔍 X OAuth Callback Debug:", {
    actualUrl: request.url,
    actualHostname: actualUrl.hostname,
    actualPathname: actualUrl.pathname,
    expectedHostname: expectedCallbackUrl?.hostname,
    expectedPathname: expectedCallbackUrl?.pathname,
    urlMatch: expectedCallbackUrl 
      ? (actualUrl.hostname === expectedCallbackUrl.hostname && actualUrl.pathname === expectedCallbackUrl.pathname)
      : "N/A",
    hasCode: !!code,
    hasState: !!state,
    hasError: !!error,
    error,
    errorDescription,
    allParams: Object.fromEntries(searchParams.entries()),
    queryString: actualUrl.search,
  });
  
  // Check if X OAuth is configured
  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET || !env.X_CALLBACK_URL) {
    console.error("❌ X OAuth not configured:", {
      hasClientId: !!env.X_CLIENT_ID,
      hasClientSecret: !!env.X_CLIENT_SECRET,
      hasCallbackUrl: !!env.X_CALLBACK_URL,
    });
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("X OAuth not configured")}`, request.url));
  }
  
  // Check for X OAuth errors first
  if (error) {
    console.error("❌ X OAuth error received:", {
      error,
      errorDescription,
      note: "User may have denied access or there's a configuration issue",
    });
    
    // Provide more specific error messages
    let errorMessage = error;
    if (errorDescription) {
      errorMessage = `${error}: ${errorDescription}`;
    } else if (error === "access_denied") {
      errorMessage = "X bağlantısı reddedildi. Lütfen tekrar deneyin.";
    } else if (error === "invalid_request") {
      errorMessage = "Geçersiz istek. Callback URI'yi kontrol edin.";
    }
    
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorMessage)}`, request.url));
  }
  
  // Check if authorization code is missing
  if (!code) {
    const receivedParams = Object.fromEntries(searchParams.entries());
    const isDirectAccess = Object.keys(receivedParams).length === 0;
    
    console.error("❌ Missing authorization code:", {
      receivedParams,
      isDirectAccess,
      expectedUrl: env.X_CALLBACK_URL,
      actualUrl: request.url,
      urlHostname: new URL(request.url).hostname,
      callbackHostname: env.X_CALLBACK_URL ? new URL(env.X_CALLBACK_URL).hostname : "N/A",
      note: isDirectAccess 
        ? "Direct access to callback URL (user didn't come from OAuth flow)"
        : "OAuth flow returned but no code parameter (check error parameter)",
    });
    
    // Check if this is a direct callback URL access (without OAuth redirect)
    let errorMsg = "Authorization code gelmedi.";
    
    if (isDirectAccess) {
      errorMsg = "Bu sayfaya doğrudan erişilemez. Lütfen 'Connect X Account' butonunu kullan.";
    } else if (searchParams.has("error")) {
      errorMsg = `X hatası: ${error || "Bilinmeyen hata"}`;
      if (errorDescription) {
        errorMsg += ` - ${errorDescription}`;
      }
    } else {
      errorMsg = "Authorization code gelmedi. Callback URI eşleşmiyor olabilir. X Developer Portal ayarlarını kontrol edin.";
    }
    
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(errorMsg)}`, request.url));
  }
  
  try {
    console.log("✅ Authorization code received, exchanging for token...");
    
    // Use exact values from env (trim whitespace)
    // Pass code_verifier for PKCE (X OAuth 2.0 requires it)
    const tokenResponse = await exchangeCodeForToken(
      code,
      env.X_CLIENT_ID,
      env.X_CLIENT_SECRET,
      env.X_CALLBACK_URL,
      codeVerifier || undefined // PKCE code_verifier
    );
    
    if (!tokenResponse) {
      console.error("❌ Failed to exchange token - exchangeCodeForToken returned null");
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("Failed to exchange token. Client ID ve Secret'ı kontrol edin.")}`, request.url));
    }
    
    console.log("✅ Token received, verifying user...");
    const xUser = await verifyXToken(tokenResponse.access_token);
    
    if (!xUser) {
      console.error("❌ Failed to verify user - verifyXToken returned null");
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("Failed to verify user")}`, request.url));
    }
    
    console.log("✅ User verified:", { username: xUser.username, x_user_id: xUser.x_user_id });
    
    // Redirect back to main page with user data in query params (or use session/cookies)
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("x_user_id", xUser.x_user_id);
    redirectUrl.searchParams.set("username", xUser.username);
    redirectUrl.searchParams.set("profile_image_url", xUser.profile_image_url);
    if (xUser.bio) {
      redirectUrl.searchParams.set("bio", xUser.bio);
    }
    
    const response = NextResponse.redirect(redirectUrl);
    
    // Clean up cookie if it was used (fallback mode)
    if (state) {
      const cookieName = `x_oauth_verifier_${state}`;
      response.cookies.delete(cookieName);
    }
    
    return response;
  } catch (error) {
    console.error("Callback error:", error);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent("Authentication failed")}`, request.url));
  }
}

