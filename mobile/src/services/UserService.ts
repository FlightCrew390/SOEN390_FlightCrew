import { API_CONFIG } from "../constants";
import { AuthTokens, User } from "../types/User";
import { ensureValidTokens } from "./EnsureValidTokens";
import { userTokenStore } from "./TokenStore";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export class UserService {
  /**
   * Exchange a Google OAuth authorization code for tokens via the backend.
   */
  static async authenticate(
    authCode: string,
    redirectUri: string,
    clientId: string,
  ): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: authCode, redirectUri, clientId }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
      clientId,
    };

    await userTokenStore.saveTokens(tokens);
    return tokens;
  }

  /**
   * Fetch the current user's profile from Google's userinfo endpoint.
   */
  static async fetchUser(tokens: AuthTokens): Promise<User> {
    const validTokens = await ensureValidTokens(tokens, userTokenStore);

    const response = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${validTokens.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        await userTokenStore.clearTokens();
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();
    return {
      id: data.sub,
      email: data.email,
      displayName: data.name,
      avatarUrl: data.picture ?? null,
    };
  }

  static async signOut(): Promise<void> {
    await userTokenStore.clearTokens();
  }
}
