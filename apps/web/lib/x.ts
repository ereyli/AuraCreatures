import axios from "axios";
import type { XUser } from "@/lib/types";

const X_API_BASE = "https://api.twitter.com/2";

export async function verifyXToken(accessToken: string): Promise<XUser | null> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        "user.fields": "profile_image_url,description",
      },
    });
    
    const user = response.data.data;
    return {
      x_user_id: user.id,
      username: user.username,
      profile_image_url: user.profile_image_url || "",
      bio: user.description || "",
    };
  } catch (error) {
    console.error("X API error:", error);
    return null;
  }
}

export async function getXUserProfile(accessToken: string, userId: string): Promise<XUser | null> {
  try {
    const response = await axios.get(`${X_API_BASE}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        "user.fields": "profile_image_url,description",
      },
    });
    
    const user = response.data.data;
    return {
      x_user_id: user.id,
      username: user.username,
      profile_image_url: user.profile_image_url || "",
      bio: user.description || "",
    };
  } catch (error) {
    console.error("X API error:", error);
    return null;
  }
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier?: string // PKCE code_verifier
): Promise<{ access_token: string; token_type: string } | null> {
  try {
    // Trim whitespace
    const cleanClientId = clientId.trim();
    const cleanClientSecret = clientSecret.trim();
    const cleanRedirectUri = redirectUri.trim();
    
    const auth = Buffer.from(`${cleanClientId}:${cleanClientSecret}`).toString("base64");
    
    console.log("🔄 Exchanging code for token:", {
      codeLength: code.length,
      redirectUri: cleanRedirectUri,
      hasCodeVerifier: !!codeVerifier,
    });
    
    // Build token request parameters
    const tokenParams: Record<string, string> = {
      code,
      grant_type: "authorization_code",
      client_id: cleanClientId,
      redirect_uri: cleanRedirectUri,
    };
    
    // Add code_verifier if PKCE is used (X OAuth 2.0 requires it)
    if (codeVerifier) {
      tokenParams.code_verifier = codeVerifier;
    }
    
    const response = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams(tokenParams),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    console.log("✅ Token exchange successful");
    return response.data;
  } catch (error: any) {
    console.error("❌ X OAuth token exchange error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      note: "Check if Client ID, Secret, and Callback URI match X Developer Portal",
    });
    
    // Provide more detailed error information
    if (error.response?.status === 400) {
      console.error("💡 Common causes: Invalid code, expired code, or redirect_uri mismatch");
    } else if (error.response?.status === 401) {
      console.error("💡 Common causes: Invalid Client ID or Secret");
    }
    
    return null;
  }
}

