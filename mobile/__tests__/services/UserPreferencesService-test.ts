import * as SecureStore from "expo-secure-store";
import {
  UserPreferences,
  UserPreferencesService,
} from "../../src/services/UserPreferencesService";

jest.mock("expo-secure-store");

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("UserPreferencesService", () => {
  describe("load", () => {
    it("returns defaults when nothing is stored", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const prefs = await UserPreferencesService.load();

      expect(prefs).toEqual({ studentId: "" });
    });

    it("returns stored preferences", async () => {
      const stored: UserPreferences = { studentId: "40012345" };
      mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(stored));

      const prefs = await UserPreferencesService.load();

      expect(prefs).toEqual(stored);
    });

    it("merges stored values with defaults for missing fields", async () => {
      // Simulate a stored object that's missing some fields
      // (e.g. saved before a new preference was added)
      mockedSecureStore.getItemAsync.mockResolvedValue(JSON.stringify({}));

      const prefs = await UserPreferencesService.load();

      expect(prefs).toEqual({ studentId: "" });
    });

    it("returns defaults when stored JSON is invalid", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue("not-json{{");

      const prefs = await UserPreferencesService.load();

      expect(prefs).toEqual({ studentId: "" });
    });

    it("returns defaults when SecureStore throws", async () => {
      mockedSecureStore.getItemAsync.mockRejectedValue(
        new Error("keychain error"),
      );

      const prefs = await UserPreferencesService.load();

      expect(prefs).toEqual({ studentId: "" });
    });
  });

  describe("save", () => {
    it("merges partial update with existing preferences", async () => {
      const existing: UserPreferences = { studentId: "40012345" };
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify(existing),
      );

      const result = await UserPreferencesService.save({
        studentId: "40099999",
      });

      expect(result).toEqual({ studentId: "40099999" });
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_preferences",
        JSON.stringify({ studentId: "40099999" }),
      );
    });

    it("preserves existing fields when updating a different field", async () => {
      const existing: UserPreferences = { studentId: "40012345" };
      mockedSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify(existing),
      );

      // Passing empty partial — nothing changes
      const result = await UserPreferencesService.save({});

      expect(result).toEqual({ studentId: "40012345" });
    });

    it("saves to defaults when nothing was previously stored", async () => {
      mockedSecureStore.getItemAsync.mockResolvedValue(null);

      const result = await UserPreferencesService.save({
        studentId: "40055555",
      });

      expect(result).toEqual({ studentId: "40055555" });
      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(
        "user_preferences",
        JSON.stringify({ studentId: "40055555" }),
      );
    });
  });

  describe("clear", () => {
    it("deletes the preferences key", async () => {
      await UserPreferencesService.clear();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        "user_preferences",
      );
    });
  });
});
