import * as SecureStoreModule from "expo-secure-store";
import { TokenStore } from "../../src/services/TokenStore";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

const SecureStore = SecureStoreModule as jest.Mocked<typeof SecureStoreModule>;

describe("TokenStore", () => {
  const prefix = "test";
  const tokenStore = new TokenStore(prefix);

  const mockTokens = {
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresAt: Date.now() + 3600000, // 1 hour from now
    clientId: "client-id",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves tokens correctly", async () => {
    await tokenStore.saveTokens(mockTokens);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${prefix}_access_token`,
      mockTokens.accessToken,
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${prefix}_refresh_token`,
      mockTokens.refreshToken,
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${prefix}_token_expires_at`,
      mockTokens.expiresAt.toString(),
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      `${prefix}_client_id`,
      mockTokens.clientId,
    );
  });

  it("retrieves tokens correctly", async () => {
    SecureStore.getItemAsync.mockImplementation((key) => {
      switch (key) {
        case `${prefix}_access_token`:
          return Promise.resolve(mockTokens.accessToken);
        case `${prefix}_refresh_token`:
          return Promise.resolve(mockTokens.refreshToken);
        case `${prefix}_token_expires_at`:
          return Promise.resolve(mockTokens.expiresAt.toString());
        case `${prefix}_client_id`:
          return Promise.resolve(mockTokens.clientId);
        default:
          return Promise.resolve(null);
      }
    });

    const tokens = await tokenStore.getTokens();
    expect(tokens).toEqual(mockTokens);
  });

  it("returns null if any token is missing", async () => {
    SecureStore.getItemAsync.mockResolvedValue(null);
    const tokens = await tokenStore.getTokens();
    expect(tokens).toBeNull();
  });

  it("clears tokens correctly", async () => {
    await tokenStore.clearTokens();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      `${prefix}_access_token`,
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      `${prefix}_refresh_token`,
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      `${prefix}_token_expires_at`,
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      `${prefix}_client_id`,
    );
  });

  it("correctly identifies expired tokens", () => {
    const expiredTokens = {
      ...mockTokens,
      expiresAt: Date.now() - 1000, // expired 1 second ago
    };
    expect(tokenStore.isExpired(expiredTokens)).toBe(true);

    const validTokens = {
      ...mockTokens,
      expiresAt: Date.now() + 3600000, // expires in 1 hour
    };
    expect(tokenStore.isExpired(validTokens)).toBe(false);
  });
});
