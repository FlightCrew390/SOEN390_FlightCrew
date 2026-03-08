import * as SecureStore from "expo-secure-store";
import { AuthTokens } from "../types/User";

/**
 * Reusable secure-storage wrapper for OAuth tokens.
 * Instantiate with a unique prefix to avoid key collisions
 * (e.g. "user" for the main session, "cal" for Google Calendar).
 */
export class TokenStore {
  private readonly accessKey: string;
  private readonly refreshKey: string;
  private readonly expiresKey: string;
  private readonly clientIdKey: string;

  constructor(prefix: string) {
    this.accessKey = `${prefix}_access_token`;
    this.refreshKey = `${prefix}_refresh_token`;
    this.expiresKey = `${prefix}_token_expires_at`;
    this.clientIdKey = `${prefix}_client_id`;
  }

  async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(this.accessKey, tokens.accessToken);
    await SecureStore.setItemAsync(this.refreshKey, tokens.refreshToken);
    await SecureStore.setItemAsync(
      this.expiresKey,
      tokens.expiresAt.toString(),
    );
    await SecureStore.setItemAsync(this.clientIdKey, tokens.clientId);
  }

  async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await SecureStore.getItemAsync(this.accessKey);
    const refreshToken = await SecureStore.getItemAsync(this.refreshKey);
    const expiresAtStr = await SecureStore.getItemAsync(this.expiresKey);
    const clientId = await SecureStore.getItemAsync(this.clientIdKey);

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

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(this.accessKey);
    await SecureStore.deleteItemAsync(this.refreshKey);
    await SecureStore.deleteItemAsync(this.expiresKey);
    await SecureStore.deleteItemAsync(this.clientIdKey);
  }

  /** Consider the token expired 60 s early to avoid mid-request failures. */
  isExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expiresAt - 60_000;
  }
}

/** Singleton stores — import these instead of constructing your own. */
export const userTokenStore = new TokenStore("user");
export const calendarTokenStore = new TokenStore("cal");
