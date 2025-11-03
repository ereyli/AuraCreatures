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
  redirectUri: string
): Promise<{ access_token: string; token_type: string } | null> {
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    // Normalize redirect URI to match authorization URL exactly
    let normalizedRedirectUri = redirectUri;
    if (normalizedRedirectUri.endsWith("/") && normalizedRedirectUri !== "https://" && normalizedRedirectUri !== "http://") {
      normalizedRedirectUri = normalizedRedirectUri.slice(0, -1);
    }
    
    console.log("🔄 Exchanging authorization code for token:", {
      codeLength: code.length,
      clientId: clientId.substring(0, 10) + "...",
      redirectUri: normalizedRedirectUri,
      originalRedirectUri: redirectUri !== normalizedRedirectUri ? redirectUri : "same",
      note: "redirect_uri MUST match exactly with authorization URL",
    });
    
    const response = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: normalizedRedirectUri, // Use normalized URI to match authorization
        // PKCE: X OAuth 2.0 for Web Apps with Client Secret doesn't require PKCE
        // Only required for Native Apps (public clients) without Client Secret
      }),
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

