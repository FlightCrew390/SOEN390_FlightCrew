import * as SecureStore from "expo-secure-store";

const PREFERENCES_KEY = "user_preferences";

export interface UserPreferences {
  studentId: string;
  accessibilityMode: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  studentId: "",
  accessibilityMode: false,
};

export class UserPreferencesService {
  static async load(): Promise<UserPreferences> {
    try {
      const raw = await SecureStore.getItemAsync(PREFERENCES_KEY);
      if (!raw) return { ...DEFAULT_PREFERENCES };

      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      return { ...DEFAULT_PREFERENCES, ...parsed };
    } catch {
      return { ...DEFAULT_PREFERENCES };
    }
  }

  static async save(
    updates: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    const current = await UserPreferencesService.load();
    const merged = { ...current, ...updates };
    await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(merged));
    return merged;
  }

  static async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(PREFERENCES_KEY);
  }
}
