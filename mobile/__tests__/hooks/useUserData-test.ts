import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useUserData } from "../../src/hooks/useUserData";
import { TokenStorageService } from "../../src/services/TokenStorageService";
import { UserPreferencesService } from "../../src/services/UserPreferencesService";
import { UserService } from "../../src/services/UserService";
import { AuthTokens, User } from "../../src/types/User";

jest.mock("../../src/services/TokenStorageService");
jest.mock("../../src/services/UserPreferencesService");
jest.mock("../../src/services/UserService");

const mockedTokenStorage = TokenStorageService as jest.Mocked<
  typeof TokenStorageService
>;
const mockedPrefs = UserPreferencesService as jest.Mocked<
  typeof UserPreferencesService
>;
const mockedUserService = UserService as jest.Mocked<typeof UserService>;

const mockTokens: AuthTokens = {
  accessToken: "access-123",
  refreshToken: "refresh-456",
  expiresAt: Date.now() + 3_600_000,
};

const mockUser: User = {
  id: "google-id",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedTokenStorage.getTokens.mockResolvedValue(null);
  mockedPrefs.load.mockResolvedValue({ studentId: "" });
});

describe("useUserData", () => {
  describe("initial state", () => {
    it("starts with loading true and no user", () => {
      const { result } = renderHook(() => useUserData());

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("finishes loading when no stored tokens exist", async () => {
      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("session restore", () => {
    it("restores user and preferences from storage", async () => {
      mockedTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedUserService.fetchUser.mockResolvedValue(mockUser);
      mockedPrefs.load.mockResolvedValue({ studentId: "40012345" });

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual({
        ...mockUser,
        studentId: "40012345",
      });
      expect(result.current.tokens).toEqual(mockTokens);
    });

    it("sets error when fetchUser fails", async () => {
      mockedTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedUserService.fetchUser.mockRejectedValue(
        new Error("Session expired"),
      );

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe("Session expired");
      expect(result.current.user).toBeNull();
    });
  });

  describe("signIn", () => {
    it("authenticates and fetches user with preferences", async () => {
      mockedUserService.authenticate.mockResolvedValue(mockTokens);
      mockedUserService.fetchUser.mockResolvedValue(mockUser);
      mockedPrefs.load.mockResolvedValue({ studentId: "40099999" });

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn("auth-code", "redirect-uri", "client-id");
      });

      expect(mockedUserService.authenticate).toHaveBeenCalledWith(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.studentId).toBe("40099999");
    });

    it("sets error on authentication failure", async () => {
      mockedUserService.authenticate.mockRejectedValue(
        new Error("Authentication failed: 401"),
      );

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.signIn("bad-code", "uri", "id");
      });

      expect(result.current.error).toBe("Authentication failed: 401");
      expect(result.current.user).toBeNull();
    });
  });

  describe("signOut", () => {
    it("clears user, tokens, and preferences", async () => {
      // First sign in
      mockedTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedUserService.fetchUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Then sign out
      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.tokens).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockedUserService.signOut).toHaveBeenCalled();
      expect(mockedPrefs.clear).toHaveBeenCalled();
    });

    it("clears local state even when service calls fail", async () => {
      mockedTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedUserService.fetchUser.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      mockedUserService.signOut.mockRejectedValue(new Error("network error"));

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("savePreference", () => {
    it("updates user and persists preference", async () => {
      mockedTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedUserService.fetchUser.mockResolvedValue(mockUser);
      mockedPrefs.save.mockResolvedValue({ studentId: "40055555" });

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.savePreference({ studentId: "40055555" });
      });

      expect(mockedPrefs.save).toHaveBeenCalledWith({
        studentId: "40055555",
      });
      expect(result.current.user?.studentId).toBe("40055555");
    });

    it("does not update user when user is null", async () => {
      mockedPrefs.save.mockResolvedValue({ studentId: "40055555" });

      const { result } = renderHook(() => useUserData());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.savePreference({ studentId: "40055555" });
      });

      expect(result.current.user).toBeNull();
    });
  });
});
