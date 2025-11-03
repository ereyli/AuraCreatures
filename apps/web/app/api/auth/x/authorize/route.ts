import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

export async function GET(request: NextRequest) {
  // Check if X OAuth is configured
  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET || !env.X_CALLBACK_URL) {
    return NextResponse.json({ 
      error: "X OAuth not configured",
      details: {
        hasClientId: !!env.X_CLIENT_ID,
        hasClientSecret: !!env.X_CLIENT_SECRET,
        hasCallbackUrl: !!env.X_CALLBACK_URL,
        callbackUrl: env.X_CALLBACK_URL || "NOT SET",
      }
    }, { status: 500 });
  }

  // Generate OAuth authorization URL
  const clientId = env.X_CLIENT_ID;
  const redirectUri = env.X_CALLBACK_URL;
  
  // Validate callback URL format
  if (!redirectUri.startsWith("http://") && !redirectUri.startsWith("https://")) {
    return NextResponse.json({ 
      error: "Invalid callback URL format",
      callbackUrl: redirectUri,
      expectedFormat: "https://your-domain.com/api/auth/x/callback"
    }, { status: 500 });
  }
  
  // X OAuth 2.0 scopes for API v2
  // users.read: Read user profile information (required for /users/me endpoint)
  const scope = "users.read";
  const state = Math.random().toString(36).substring(7);
  
  // Validate and normalize redirect URI
  let normalizedRedirectUri = redirectUri;
  
  // Remove trailing slash if present
  if (normalizedRedirectUri.endsWith("/") && normalizedRedirectUri !== "https://" && normalizedRedirectUri !== "http://") {
    normalizedRedirectUri = normalizedRedirectUri.slice(0, -1);
  }
  
  // Ensure https:// protocol
  if (!normalizedRedirectUri.startsWith("https://")) {
    console.warn("⚠️ Redirect URI should use https:// protocol");
  }
  
  // X OAuth 2.0 authorization URL format
  // Correct endpoint: https://twitter.com/i/oauth2/authorize (NOT /api/2/oauth2/authorize)
  // ALL parameters must be properly URL-encoded
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: normalizedRedirectUri,
    scope: scope,
    state: state,
  });
  
  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  
  // Verify URL encoding
  console.log("🔍 Authorization URL Components:", {
    endpoint: "https://twitter.com/i/oauth2/authorize",
    clientId: clientId.substring(0, 15) + "...",
    redirectUri: normalizedRedirectUri,
    redirectUriEncoded: encodeURIComponent(normalizedRedirectUri),
    scope,
    state,
    fullUrl: authUrl.substring(0, 150) + "...",
  });
  
  // Log for debugging (always log in production too for troubleshooting)
  console.log("🔍 X OAuth Authorization URL Generated:", {
    clientId: clientId.substring(0, 10) + "...",
    redirectUri,
    callbackPath: new URL(redirectUri).pathname,
    scope,
    authUrlLength: authUrl.length,
    note: "Make sure redirectUri matches EXACTLY in X Developer Portal",
  });
  
  return NextResponse.json({ 
    authUrl,
    redirectUri: normalizedRedirectUri, // Return normalized URI for verification
    debug: process.env.NODE_ENV === "development" ? {
      redirectUri: normalizedRedirectUri,
      originalRedirectUri: redirectUri !== normalizedRedirectUri ? redirectUri : "same",
      callbackPath: new URL(normalizedRedirectUri).pathname,
      note: "Make sure this callback URI matches EXACTLY in X Developer Portal",
    } : undefined,
  });
}

