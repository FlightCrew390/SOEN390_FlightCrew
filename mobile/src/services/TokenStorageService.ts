import * as SecureStore from "expo-secure-store";
import { AuthTokens } from "../types/User";

const ACCESS_TOKEN_KEY = "user_access_token";
const REFRESH_TOKEN_KEY = "user_refresh_token";
const EXPIRES_AT_KEY = "user_token_expires_at";
const CLIENT_ID_KEY = "user_client_id";

export class TokenStorageService {
  static async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await SecureStore.setItemAsync(EXPIRES_AT_KEY, tokens.expiresAt.toString());
    await SecureStore.setItemAsync(CLIENT_ID_KEY, tokens.clientId);
  }

  static async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const expiresAtStr = await SecureStore.getItemAsync(EXPIRES_AT_KEY);
    const clientId = await SecureStore.getItemAsync(CLIENT_ID_KEY);

    if (!accessToken || !refreshToken || !expiresAtStr || !clientId) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: Number.parseInt(expiresAtStr, 10),
      clientId,
    };
  }

  static async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(EXPIRES_AT_KEY);
    await SecureStore.deleteItemAsync(CLIENT_ID_KEY);
  }

  static isExpired(tokens: AuthTokens): boolean {
    // Consider expired 60s early to avoid mid-request expiration
    return Date.now() >= tokens.expiresAt - 60_000;
  }
}
