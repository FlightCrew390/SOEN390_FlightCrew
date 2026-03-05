import { useCallback, useEffect, useState } from "react";
import { TokenStorageService } from "../services/TokenStorageService";
import {
  UserPreferences,
  UserPreferencesService,
} from "../services/UserPreferencesService";
import { UserService } from "../services/UserService";
import { AuthTokens, User } from "../types/User";

function mergePreferences(user: User, prefs: UserPreferences): User {
  return { ...user, studentId: prefs.studentId || undefined };
}

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

        const [fetchedUser, prefs] = await Promise.all([
          UserService.fetchUser(storedTokens),
          UserPreferencesService.load(),
        ]);

        if (isMounted) {
          setTokens(storedTokens);
          setUser(mergePreferences(fetchedUser, prefs));
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

  const signIn = useCallback(
    async (authCode: string, redirectUri: string, clientId: string) => {
      try {
        setLoading(true);
        setError(null);

        const newTokens = await UserService.authenticate(
          authCode,
          redirectUri,
          clientId,
        );

        const [fetchedUser, prefs] = await Promise.all([
          UserService.fetchUser(newTokens),
          UserPreferencesService.load(),
        ]);

        setTokens(newTokens);
        setUser(mergePreferences(fetchedUser, prefs));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await Promise.all([
        UserService.signOut(),
        UserPreferencesService.clear(),
      ]);
    } catch {
      // Always clear local state even if something fails
    } finally {
      setUser(null);
      setTokens(null);
      setError(null);
    }
  }, []);

  /**
   * Persist a partial preference update and sync it into the user object.
   * Uses functional setUser to avoid stale closure issues.
   */
  const savePreference = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const merged = await UserPreferencesService.save(updates);
      setUser((prev) => (prev ? mergePreferences(prev, merged) : prev));
    },
    [],
  );

  return {
    user,
    tokens,
    isAuthenticated: user != null,
    loading,
    error,
    signIn,
    signOut,
    savePreference,
  };
};
