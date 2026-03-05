import { API_CONFIG } from "../constants";
import { AuthTokens, User } from "../types/User";
import { TokenStorageService } from "./TokenStorageService";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export class UserService {
  /**
   * Exchange a Google OAuth authorization code for tokens via the backend.
   * The backend calls Google's token endpoint, so it needs the same
   * redirectUri the frontend used when requesting the code.
   */
  static async authenticate(
    authCode: string,
    redirectUri: string,
  ): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: authCode, redirectUri }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status}`);
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
    };

    await TokenStorageService.saveTokens(tokens);
    return tokens;
  }

  /**
   * Fetch the current user's profile from Google's userinfo endpoint
   * using the access token.
   */
  static async fetchUser(tokens: AuthTokens): Promise<User> {
    const validTokens = await UserService.ensureValidTokens(tokens);

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
        await TokenStorageService.clearTokens();
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

  /**
   * Sign the user out — clear stored tokens.
   */
  static async signOut(): Promise<void> {
    await TokenStorageService.clearTokens();
  }

  /**
   * Refresh the access token via the backend.
   * Returns the updated tokens, or throws if the refresh token is invalid.
   */
  private static async ensureValidTokens(
    tokens: AuthTokens,
  ): Promise<AuthTokens> {
    if (!TokenStorageService.isExpired(tokens)) {
      return tokens;
    }

    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      await TokenStorageService.clearTokens();
      throw new Error("Session expired. Please sign in again.");
    }

    const data = await response.json();
    const refreshed: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
    };

    await TokenStorageService.saveTokens(refreshed);
    return refreshed;
  }
}
