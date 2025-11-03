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

  // Simple, direct OAuth URL generation - no normalization, use exact values
  const clientId = env.X_CLIENT_ID.trim(); // Remove any whitespace
  const redirectUri = env.X_CALLBACK_URL.trim(); // Remove any whitespace
  
  // Basic validation
  if (!redirectUri.startsWith("https://")) {
    return NextResponse.json({ 
      error: "Callback URL must use https://",
      callbackUrl: redirectUri
    }, { status: 500 });
  }
  
  // X OAuth 2.0 - minimal required parameters
  const scope = "users.read";
  const state = Math.random().toString(36).substring(7);
  
  // Build URL - use exact redirect_uri from env (must match X Portal exactly)
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;
  
  console.log("🔗 X OAuth URL:", {
    clientIdLength: clientId.length,
    redirectUri,
    urlLength: authUrl.length
  });
  
  return NextResponse.json({ authUrl });
}

