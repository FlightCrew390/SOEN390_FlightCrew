import { ensureValidTokens } from "../../src/services/EnsureValidTokens";
import { calendarTokenStore } from "../../src/services/TokenStore";
import { AuthTokens } from "../../src/types/User";

jest.mock("../../src/services/TokenStore", () => ({
  calendarTokenStore: {
    saveTokens: jest.fn((tokens: AuthTokens) => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve(null)),
    clearTokens: jest.fn(() => Promise.resolve()),
    isExpired: jest.fn((tokens: AuthTokens) => {
      return Date.now() >= tokens.expiresAt - 60_000; // Consider tokens expired if within 1 minute of expiry
    }),
  },
}));

describe("ensureValidTokens", () => {
  const mockTokens: AuthTokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: Date.now() + 3600000, // 1 hour from now
    clientId: "client-id",
  };

  const expiredTokens: AuthTokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: Date.now() - 3600000, // 1 hour ago
    clientId: "client-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns valid tokens without refreshing", async () => {
    const result = await ensureValidTokens(mockTokens, calendarTokenStore);
    expect(result).toEqual(mockTokens);
    expect(calendarTokenStore.isExpired).toHaveBeenCalledWith(mockTokens);
  });

  it("refreshes expired tokens and saves new tokens", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
          expiresInSeconds: 3600,
        }),
    };
    globalThis.fetch = jest.fn().mockResolvedValue(mockResponse);

    const result = await ensureValidTokens(expiredTokens, calendarTokenStore);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:9090/api/v1/auth/refresh",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: expiredTokens.refreshToken,
          clientId: expiredTokens.clientId,
        }),
      }),
    );
    expect(calendarTokenStore.saveTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        clientId: expiredTokens.clientId,
      }),
    );
    expect(result.accessToken).toBe("new-access-token");
  });
});
