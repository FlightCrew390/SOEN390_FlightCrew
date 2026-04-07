import { AuthTokens } from "../types/User";
import { API_CONFIG } from "../constants";

const API_BASE_URL = API_CONFIG.getBaseUrl();

/**
 * Common logic for Google OAuth authentication shared across services.
 */
export class GoogleAuthBase {
  /**
   * Exchange a Google OAuth authorization code for tokens via the backend.
   */
  static async exchangeCodeForTokens(
    authCode: string,
    redirectUri: string,
    clientId: string,
    errorPrefix: string = "Authentication failed",
  ): Promise<AuthTokens> {
    const response = await fetch(`${API_BASE_URL}/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: authCode, redirectUri, clientId }),
    });

    if (!response.ok) {
      throw new Error(`${errorPrefix}: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
      clientId,
    };
  }
}
