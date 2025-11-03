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
  // offline.access: Request refresh token (optional, for long-lived tokens)
  // Note: Space-separated format is correct for X OAuth 2.0
  const scope = "users.read offline.access";
  const state = Math.random().toString(36).substring(7);
  
  // X OAuth 2.0 authorization URL (without PKCE for simplicity)
  // Note: X OAuth 2.0 supports both with and without PKCE
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  
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
    debug: process.env.NODE_ENV === "development" ? {
      redirectUri,
      callbackPath: new URL(redirectUri).pathname,
      note: "Make sure this callback URI matches EXACTLY in X Developer Portal",
    } : undefined,
  });
}

