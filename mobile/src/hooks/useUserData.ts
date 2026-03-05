import { useCallback, useEffect, useState } from "react";
import { TokenStorageService } from "../services/TokenStorageService";
import { UserService } from "../services/UserService";
import { AuthTokens, User } from "../types/User";

export const useUserData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, attempt to restore session from secure storage
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedTokens = await TokenStorageService.getTokens();
        if (!storedTokens) {
          if (isMounted) setLoading(false);
          return;
        }

        const fetchedUser = await UserService.fetchUser(storedTokens);
        if (isMounted) {
          setTokens(storedTokens);
          setUser(fetchedUser);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to restore session",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const signIn = useCallback(async (authCode: string, redirectUri: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1. Exchange auth code for tokens via the backend
      const newTokens = await UserService.authenticate(authCode, redirectUri);

      // 2. Fetch user profile from Google using the access token
      const fetchedUser = await UserService.fetchUser(newTokens);

      setTokens(newTokens);
      setUser(fetchedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await UserService.signOut();
    } catch {
      // Always clear local state even if something fails
    } finally {
      setUser(null);
      setTokens(null);
      setError(null);
    }
  }, []);

  return {
    user,
    tokens,
    isAuthenticated: user != null,
    loading,
    error,
    signIn,
    signOut,
  };
};
