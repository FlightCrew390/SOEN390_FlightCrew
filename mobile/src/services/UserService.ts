import { AuthTokens, User } from "../types/User";
import { ensureValidTokens } from "./EnsureValidTokens";
import { userTokenStore } from "./TokenStore";
import { GoogleAuthBase } from "./GoogleAuthBase";

export class UserService {
  /**
   * Exchange a Google OAuth authorization code for tokens via the backend.
   */
  static async authenticate(
    authCode: string,
    redirectUri: string,
    clientId: string,
  ): Promise<AuthTokens> {
    const tokens = await GoogleAuthBase.exchangeCodeForTokens(
      authCode,
      redirectUri,
      clientId,
    );

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
