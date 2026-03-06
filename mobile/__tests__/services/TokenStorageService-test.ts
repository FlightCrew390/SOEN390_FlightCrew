import * as SecureStore from "expo-secure-store";
import { TokenStorageService } from "../../src/services/TokenStorageService";
import { AuthTokens } from "../../src/types/User";

jest.mock("expo-secure-store");

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

const mockTokens: AuthTokens = {
  clientId: "client-789",
  accessToken: "access-123",
  refreshToken: "refresh-456",
  expiresAt: Date.now() + 3_600_000,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("TokenStorageService", () => {
  describe("saveTokens", () => {
    it("stores all four token fields in secure store", async () => {
      await TokenStorageService.saveTokens(mockTokens);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledTimes(4);
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_access_token",
        mockTokens.accessToken,
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_refresh_token",
        mockTokens.refreshToken,
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_token_expires_at",
        mockTokens.expiresAt.toString(),
      );
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_client_id",
        mockTokens.clientId,
      );
    });
  });

  describe("getTokens", () => {
    it("returns tokens when all fields are stored", async () => {
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString())
        .mockResolvedValueOnce(mockTokens.clientId);

      const result = await TokenStorageService.getTokens();

      expect(result).toEqual(mockTokens);
    });

    it("returns null when access token is missing", async () => {
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString())
        .mockResolvedValueOnce(mockTokens.clientId);

      const result = await TokenStorageService.getTokens();

      expect(result).toBeNull();
    });

    it("returns null when refresh token is missing", async () => {
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString())
        .mockResolvedValueOnce(mockTokens.clientId);

      const result = await TokenStorageService.getTokens();

      expect(result).toBeNull();
    });

    it("returns null when expiresAt is missing", async () => {
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockTokens.clientId);

      const result = await TokenStorageService.getTokens();

      expect(result).toBeNull();
    });

    it("returns null when clientId is missing", async () => {
      mockedSecureStore.getItemAsync
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken)
        .mockResolvedValueOnce(mockTokens.expiresAt.toString())
        .mockResolvedValueOnce(null);

      const result = await TokenStorageService.getTokens();

      expect(result).toBeNull();
    });
  });

  describe("clearTokens", () => {
    it("deletes all four token fields", async () => {
      await TokenStorageService.clearTokens();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledTimes(4);
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "user_access_token",
      );
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "user_refresh_token",
      );
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "user_token_expires_at",
      );
      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "user_client_id",
      );
    });
  });

  describe("isExpired", () => {
    it("returns false when token is still valid", () => {
      const tokens: AuthTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 120_000,
      };

      expect(TokenStorageService.isExpired(tokens)).toBe(false);
    });

    it("returns true when token is past expiry", () => {
      const tokens: AuthTokens = {
        ...mockTokens,
        expiresAt: Date.now() - 1000,
      };

      expect(TokenStorageService.isExpired(tokens)).toBe(true);
    });

    it("returns true when token expires within the 60s buffer", () => {
      const tokens: AuthTokens = {
        ...mockTokens,
        expiresAt: Date.now() + 30_000,
      };

      expect(TokenStorageService.isExpired(tokens)).toBe(true);
    });
  });
});
