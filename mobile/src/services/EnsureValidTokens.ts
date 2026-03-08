import { API_CONFIG } from "../constants";
import { AuthTokens } from "../types/User";
import { TokenStore } from "./TokenStore";

const API_BASE_URL = API_CONFIG.getBaseUrl();

/**
 * If the given tokens are still valid, return them as-is.
 * Otherwise hit the backend refresh endpoint and persist the new tokens.
 *
 * Shared between UserService and CalendarService so the refresh logic
 * lives in exactly one place.
 */
export async function ensureValidTokens(
  tokens: AuthTokens,
  store: TokenStore,
): Promise<AuthTokens> {
  if (!store.isExpired(tokens)) {
    return tokens;
  }

  const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refreshToken: tokens.refreshToken,
      clientId: tokens.clientId,
    }),
  });

  if (!response.ok) {
    await store.clearTokens();
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await response.json();
  const refreshed: AuthTokens = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken ?? tokens.refreshToken,
    expiresAt: Date.now() + data.expiresInSeconds * 1000,
    clientId: tokens.clientId,
  };

  await store.saveTokens(refreshed);
  return refreshed;
}
