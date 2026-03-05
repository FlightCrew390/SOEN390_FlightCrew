import * as SecureStore from "expo-secure-store";

const PREFERENCES_KEY = "user_preferences";

export interface UserPreferences {
  studentId: string;
  // Add future local-only preferences here, e.g.:
  // preferredCampus: CampusId;
  // notificationsEnabled: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  studentId: "",
};

export class UserPreferencesService {
  /**
   * Load all saved preferences, falling back to defaults
   * for any missing fields.
   */
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

  /**
   * Save a partial update — merges with existing preferences
   * so callers don't need to pass every field.
   */
  static async save(
    updates: Partial<UserPreferences>,
  ): Promise<UserPreferences> {
    const current = await UserPreferencesService.load();
    const merged = { ...current, ...updates };
    await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(merged));
    return merged;
  }

  /**
   * Clear all stored preferences (e.g. on sign-out).
   */
  static async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(PREFERENCES_KEY);
  }
}
