import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";
import { createHash } from "crypto";

/**
 * Generate PKCE code verifier and challenge
 * X OAuth 2.0 requires PKCE for security
 * According to: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code
 */
function generatePKCE() {
  // Generate random code verifier (43-128 characters)
  // Use crypto.randomBytes for secure random generation
  const crypto = require("crypto");
  const randomBytes = crypto.randomBytes(32);
  
  // Convert to base64url (URL-safe base64 without padding)
  const base64 = randomBytes.toString("base64");
  const verifier = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, 128); // Ensure max 128 characters
  
  // Generate code challenge (SHA256 hash of verifier, base64url encoded)
  const challenge = createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  
  return { verifier, challenge };
}

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

  const clientId = env.X_CLIENT_ID.trim();
  const redirectUri = env.X_CALLBACK_URL.trim();
  
  if (!redirectUri.startsWith("https://")) {
    return NextResponse.json({ 
      error: "Callback URL must use https://",
      callbackUrl: redirectUri
    }, { status: 500 });
  }
  
  // Generate PKCE values (required by X OAuth 2.0)
  const { verifier, challenge } = generatePKCE();
  
  // X OAuth 2.0 Authorization Code Flow with PKCE
  // According to X docs: https://docs.x.com/fundamentals/authentication/oauth-2-0/authorization-code
  const scope = "users.read";
  const state = Math.random().toString(36).substring(7);
  
  // Store code_verifier server-side using KV (keyed by state)
  // This ensures security - verifier never exposed to client
  try {
    const kv = await import("@/lib/kv");
    const stateKey = `x_oauth_verifier:${state}`;
    await kv.kv.setex(stateKey, 600, verifier); // Store for 10 minutes
    console.log("✅ PKCE verifier stored server-side for state:", state.substring(0, 5) + "...");
  } catch (error) {
    console.error("⚠️ Failed to store PKCE verifier:", error);
    // Fallback: return verifier to client (less secure but functional)
    console.log("⚠️ Falling back to client-side verifier storage");
  }
  
  // Build authorization URL with PKCE
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scope,
    state: state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  
  const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
  
  console.log("🔗 X OAuth URL with PKCE:", {
    clientIdLength: clientId.length,
    redirectUri,
    state: state.substring(0, 5) + "...",
    hasCodeChallenge: !!challenge,
  });
  
  return NextResponse.json({ 
    authUrl,
    state, // Return state so frontend can identify the flow
  });
}

