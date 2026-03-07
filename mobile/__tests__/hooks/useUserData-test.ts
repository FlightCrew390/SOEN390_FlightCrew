import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useUserData } from "../../src/hooks/useUserData";
import { userTokenStore } from "../../src/services/TokenStore";
import { UserPreferencesService } from "../../src/services/UserPreferencesService";
import { UserService } from "../../src/services/UserService";
import { AuthTokens, User } from "../../src/types/User";

jest.mock("../../src/services/TokenStore", () => ({
  userTokenStore: {
    saveTokens: jest.fn((tokens: AuthTokens) => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve(null)),
    clearTokens: jest.fn(() => Promise.resolve()),
    isExpired: jest.fn((tokens) => false),
  },
}));
jest.mock("../../src/services/UserPreferencesService", () => ({
  UserPreferencesService: {
    save: jest.fn((updates) => Promise.resolve({ ...updates })),
    load: jest.fn(() => Promise.resolve({ studentId: "" })),
    clear: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock("../../src/services/UserService", () => ({
  UserService: {
    authenticate: jest.fn((authCode, redirectUri, clientId) => {
      return Promise.resolve({ mockTokens });
    }),
    fetchUser: jest.fn((tokens) => {
      return Promise.resolve({ mockUser });
    }),
    signOut: jest.fn(() => Promise.resolve()),
  },
}));

const mockTokens: AuthTokens = {
  clientId: "client-id-456",
  accessToken: "access-123",
  refreshToken: "refresh-456",
  expiresAt: Date.now() + 3_600_000,
};

const mockUser: User = {
  id: "google-id",
  email: "test@example.com",
  displayName: "Test User",
  avatarUrl: null,
  studentId: "",
};

beforeEach(() => {
  jest.clearAllMocks();
  (userTokenStore.getTokens as jest.Mock).mockResolvedValue(mockTokens);
  (UserService.fetchUser as jest.Mock).mockResolvedValue(mockUser);
  (UserPreferencesService.load as jest.Mock).mockResolvedValue({
    studentId: "12345",
  });
});

describe("useUserData", () => {
  it("restores session on mount", async () => {
    (UserService.fetchUser as jest.Mock).mockResolvedValue(mockUser);
    (UserPreferencesService.load as jest.Mock).mockResolvedValue({
      studentId: "12345",
    });

    const { result } = renderHook(() => useUserData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.tokens).toEqual(mockTokens);
      expect(result.current.user).toEqual({
        ...mockUser,
        studentId: "12345",
      });
    });
  });

  it("handles sign-in correctly", async () => {
    const { result } = renderHook(() => useUserData());

    await act(async () => {
      await result.current.signIn("auth-code", "redirect-uri", "client-id");
    });

    expect(UserService.authenticate).toHaveBeenCalledWith(
      "auth-code",
      "redirect-uri",
      "client-id",
    );
    expect(UserService.fetchUser).toHaveBeenCalledWith(mockTokens);
    expect(UserPreferencesService.load).toHaveBeenCalled();
    expect(result.current.user).toEqual({
      ...mockUser,
      studentId: "12345",
    });
  });

  it("handles sign-out correctly", async () => {
    const { result } = renderHook(() => useUserData());

    // First sign in to set some user data
    await act(async () => {
      await result.current.signIn("auth-code", "redirect-uri", "client-id");
    });

    expect(result.current.user).not.toBeNull();

    // Then sign out
    await act(async () => {
      await result.current.signOut();
    });

    expect(UserService.signOut).toHaveBeenCalled();
    expect(UserPreferencesService.clear).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
  });

  it("saves preferences correctly", async () => {
    const { result } = renderHook(() => useUserData());

    // First sign in to set some user data
    await act(async () => {
      await result.current.signIn("auth-code", "redirect-uri", "client-id");
    });

    // Then save a preference
    await act(async () => {
      await result.current.savePreference({ studentId: "67890" });
    });

    expect(UserPreferencesService.save).toHaveBeenCalledWith({
      studentId: "67890",
    });
    expect(result.current.user).toEqual({
      ...mockUser,
      studentId: "67890",
    });
  });

  it("handles errors during sign-in", async () => {
    (UserService.authenticate as jest.Mock).mockRejectedValueOnce(
      new Error("Authentication failed"),
    );
    (userTokenStore.getTokens as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useUserData());

    await act(async () => {
      await result.current.signIn("auth-code", "redirect-uri", "client-id");
    });

    expect(result.current.error).toBe("Sign-in failed: Authentication failed");
    expect(result.current.user).toBeNull();
    expect(result.current.tokens).toBeNull();
  });
});
