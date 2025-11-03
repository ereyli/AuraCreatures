import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

export async function GET(request: NextRequest) {
  // Check if X OAuth is configured
  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET || !env.X_CALLBACK_URL) {
    return NextResponse.json({ error: "X OAuth not configured" }, { status: 500 });
  }

  // Generate OAuth authorization URL
  const clientId = env.X_CLIENT_ID;
  const redirectUri = env.X_CALLBACK_URL;
  // X OAuth 2.0 scopes for API v2
  // users.read: Read user profile information
  // offline.access: Request refresh token (optional)
  const scope = "users.read offline.access";
  const state = Math.random().toString(36).substring(7);
  
  // X OAuth 2.0 authorization URL (without PKCE for simplicity)
  // Note: X OAuth 2.0 supports both with and without PKCE
  const authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;
  
  return NextResponse.json({ authUrl });
}

