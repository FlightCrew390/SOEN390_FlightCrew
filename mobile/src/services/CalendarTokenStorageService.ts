import * as SecureStore from "expo-secure-store";
import { AuthTokens } from "../types/User";

const CAL_ACCESS_TOKEN_KEY = "cal_access_token";
const CAL_REFRESH_TOKEN_KEY = "cal_refresh_token";
const CAL_EXPIRES_AT_KEY = "cal_token_expires_at";
const CAL_CLIENT_ID_KEY = "cal_client_id";

export class CalendarTokenStorageService {
  static async saveTokens(tokens: AuthTokens): Promise<void> {
    await SecureStore.setItemAsync(CAL_ACCESS_TOKEN_KEY, tokens.accessToken);
    await SecureStore.setItemAsync(CAL_REFRESH_TOKEN_KEY, tokens.refreshToken);
    await SecureStore.setItemAsync(
      CAL_EXPIRES_AT_KEY,
      tokens.expiresAt.toString(),
    );
    await SecureStore.setItemAsync(CAL_CLIENT_ID_KEY, tokens.clientId);
  }

  static async getTokens(): Promise<AuthTokens | null> {
    const accessToken = await SecureStore.getItemAsync(CAL_ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(CAL_REFRESH_TOKEN_KEY);
    const expiresAtStr = await SecureStore.getItemAsync(CAL_EXPIRES_AT_KEY);
    const clientId = await SecureStore.getItemAsync(CAL_CLIENT_ID_KEY);

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
    await SecureStore.deleteItemAsync(CAL_ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(CAL_REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(CAL_EXPIRES_AT_KEY);
    await SecureStore.deleteItemAsync(CAL_CLIENT_ID_KEY);
  }

  static isExpired(tokens: AuthTokens): boolean {
    return Date.now() >= tokens.expiresAt - 60_000;
  }
}
