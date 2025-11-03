import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env.mjs";

/**
 * Test endpoint to verify X OAuth configuration
 * Returns detailed information about configuration without exposing secrets
 */
export async function GET(request: NextRequest) {
  const checks = {
    clientId: {
      exists: !!env.X_CLIENT_ID,
      length: env.X_CLIENT_ID?.length || 0,
      startsWith: env.X_CLIENT_ID?.substring(0, 3) || "N/A",
      format: env.X_CLIENT_ID?.match(/^[A-Za-z0-9_-]+$/) ? "✅ Valid format" : "❌ Invalid format",
    },
    clientSecret: {
      exists: !!env.X_CLIENT_SECRET,
      length: env.X_CLIENT_SECRET?.length || 0,
      startsWith: env.X_CLIENT_SECRET?.substring(0, 3) || "N/A",
    },
    callbackUrl: {
      exists: !!env.X_CALLBACK_URL,
      value: env.X_CALLBACK_URL || "NOT SET",
      protocol: env.X_CALLBACK_URL?.startsWith("https://") ? "✅ https://" : env.X_CALLBACK_URL?.startsWith("http://") ? "⚠️ http:// (should be https://)" : "❌ Invalid",
      hasTrailingSlash: env.X_CALLBACK_URL?.endsWith("/") ? "❌ Has trailing slash" : "✅ No trailing slash",
      path: env.X_CALLBACK_URL ? new URL(env.X_CALLBACK_URL).pathname : "N/A",
      hostname: env.X_CALLBACK_URL ? new URL(env.X_CALLBACK_URL).hostname : "N/A",
    },
  };

  const issues: string[] = [];
  
  if (!checks.clientId.exists) {
    issues.push("❌ X_CLIENT_ID is missing");
  } else if (checks.clientId.length < 10) {
    issues.push("⚠️ X_CLIENT_ID seems too short");
  }
  
  if (!checks.clientSecret.exists) {
    issues.push("❌ X_CLIENT_SECRET is missing");
  } else if (checks.clientSecret.length < 10) {
    issues.push("⚠️ X_CLIENT_SECRET seems too short");
  }
  
  if (!checks.callbackUrl.exists) {
    issues.push("❌ X_CALLBACK_URL is missing");
  } else {
    if (!checks.callbackUrl.value.startsWith("https://")) {
      issues.push("⚠️ X_CALLBACK_URL should use https:// protocol");
    }
    if (checks.callbackUrl.value.endsWith("/")) {
      issues.push("⚠️ X_CALLBACK_URL should not end with /");
    }
    if (checks.callbackUrl.path !== "/api/auth/x/callback") {
      issues.push(`⚠️ Callback path should be "/api/auth/x/callback" but is "${checks.callbackUrl.path}"`);
    }
  }

  return NextResponse.json({
    status: issues.length === 0 ? "✅ Configuration looks good" : "⚠️ Configuration issues found",
    checks,
    issues,
    recommendations: [
      "1. Verify X_CLIENT_ID matches X Developer Portal → Keys and tokens → OAuth 2.0 Client ID",
      "2. Verify X_CLIENT_SECRET matches X Developer Portal → Keys and tokens → OAuth 2.0 Client Secret",
      "3. Verify X_CALLBACK_URL matches EXACTLY in X Developer Portal → Settings → User authentication settings → Callback URI",
      "4. Ensure Callback URI in X Portal: https://aura-creatures.vercel.app/api/auth/x/callback (no trailing slash)",
      "5. Ensure App permissions: Read (in X Developer Portal)",
      "6. Ensure Type of App: Web App, Automated App or Bot (in X Developer Portal)",
      "7. After changes in X Portal, wait 1-2 minutes for propagation",
    ],
    testAuthorizationUrl: checks.clientId.exists && checks.callbackUrl.exists
      ? (() => {
          const params = new URLSearchParams({
            response_type: "code",
            client_id: env.X_CLIENT_ID!,
            redirect_uri: env.X_CALLBACK_URL!,
            scope: "users.read",
            state: "test_check",
          });
          return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
        })()
      : "Cannot generate - missing configuration",
  });
}

