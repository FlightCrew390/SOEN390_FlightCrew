import { userTokenStore } from "../../src/services/TokenStore";
import { UserService } from "../../src/services/UserService";
import { AuthTokens } from "../../src/types/User";

jest.mock("../../src/services/TokenStore", () => ({
  userTokenStore: {
    saveTokens: jest.fn((tokens: AuthTokens) => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve(null)),
    clearTokens: jest.fn(() => Promise.resolve()),
    isExpired: jest.fn((tokens: AuthTokens) => {
      return false;
    }),
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

const validTokens: AuthTokens = {
  clientId: "client-id-456",
  accessToken: "access-123",
  refreshToken: "refresh-456",
  expiresAt: Date.now() + 3_600_000,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UserService", () => {
  describe("authenticate", () => {
    it("exchanges auth code for tokens and saves them", async () => {
      const serverResponse = {
        clientId: "client-id-456",
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresInSeconds: 3600,
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(serverResponse),
      });

      const before = Date.now();
      const result: AuthTokens = await UserService.authenticate(
        "auth-code-123",
        "com.test:/redirect",
        "client-id-456",
      );

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/v1/auth/google"),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            code: "auth-code-123",
            redirectUri: "com.test:/redirect",
            clientId: "client-id-456",
          }),
        }),
      );
      expect(result.accessToken).toBe("new-access");
      expect(result.refreshToken).toBe("new-refresh");
      expect(result.expiresAt).toBeGreaterThanOrEqual(before + 3_600_000);
      expect(userTokenStore.saveTokens).toHaveBeenCalledWith(result);
    });

    it("throws on non-OK response", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });

      await expect(
        UserService.authenticate("code", "uri", "id"),
      ).rejects.toThrow("Authentication failed: 401");
    });
  });

  describe("fetchUser", () => {
    it("fetches user profile from Google userinfo endpoint", async () => {
      const googleProfile = {
        sub: "google-id-789",
        email: "test@example.com",
        name: "Test User",
        picture: "https://example.com/photo.jpg",
      };
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(googleProfile),
      });

      const user = await UserService.fetchUser(validTokens);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        expect.objectContaining({
          headers: { Authorization: "Bearer access-123" },
        }),
      );
      expect(user).toEqual({
        id: "google-id-789",
        email: "test@example.com",
        displayName: "Test User",
        avatarUrl: "https://example.com/photo.jpg",
      });
    });

    it("sets avatarUrl to null when picture is missing", async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            sub: "id",
            email: "a@b.com",
            name: "No Photo",
          }),
      });

      const user = await UserService.fetchUser(validTokens);

      expect(user.avatarUrl).toBeNull();
    });

    it("clears tokens and throws on 401", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 401 });

      await expect(UserService.fetchUser(validTokens)).rejects.toThrow(
        "Session expired",
      );
      expect(userTokenStore.clearTokens).toHaveBeenCalled();
    });

    it("throws on other non-OK responses", async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(UserService.fetchUser(validTokens)).rejects.toThrow(
        "Failed to fetch user: 500",
      );
    });
  });

  describe("signOut", () => {
    it("clears stored tokens", async () => {
      await UserService.signOut();

      expect(userTokenStore.clearTokens).toHaveBeenCalled();
    });
  });
});
