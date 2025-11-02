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
    const response = await axios.post(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        code,
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: "", // PKCE if used
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error("X OAuth error:", error);
    return null;
  }
}

