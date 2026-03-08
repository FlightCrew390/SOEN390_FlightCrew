import { CalendarService } from "../../src/services/CalendarService";
import { ensureValidTokens } from "../../src/services/EnsureValidTokens";
import { calendarTokenStore, TokenStore } from "../../src/services/TokenStore";
import { CalendarEvent } from "../../src/types/CalendarEvent";
import { AuthTokens } from "../../src/types/User";

jest.mock("../../src/services/EnsureValidTokens", () => ({
  ensureValidTokens: jest.fn((tokens: AuthTokens, store: TokenStore) =>
    Promise.resolve(tokens),
  ),
}));

jest.mock("../../src/services/TokenStore", () => ({
  calendarTokenStore: {
    saveTokens: jest.fn((tokens: AuthTokens) => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve(null)),
    clearTokens: jest.fn(() => Promise.resolve()),
    isExpired: jest.fn((tokens: AuthTokens) => {
      return false;
    }),
  },
}));

jest.mock("../../src/constants", () => ({
  API_CONFIG: {
    getBaseUrl: jest.fn(() => "http://localhost:9090/api"),
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockClear();
});

describe("CalendarService", () => {
  const mockAuthCode = "auth-code-123";
  const mockRedirectUri = "com.example.app:/oauthredirect";
  const mockClientId = "client-id-456";

  const mockTokens: AuthTokens = {
    accessToken: "access-token-789",
    refreshToken: "refresh-token-101",
    expiresAt: Date.now() + 3600000, // 1 hour from now
    clientId: mockClientId,
  };

  const mockCalendarEvents: CalendarEvent[] = [
    {
      id: "event1",
      summary: "Test Event 1",
      description: "Description 1",
      location: "Location 1",
      start: "2024-01-01T10:00:00Z",
      end: "2024-01-01T11:00:00Z",
      allDay: false,
    },
    {
      id: "event2",
      summary: "Test Event 2",
      description: "Description 2",
      location: "Location 2",
      start: "2024-01-02T14:00:00Z",
      end: "2024-01-02T15:30:00Z",
      allDay: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe("connectCalendar", () => {
    it("successfully connects calendar and saves tokens", async () => {
      const mockResponse = {
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
        expiresInSeconds: 3600,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await CalendarService.connectCalendar(
        mockAuthCode,
        mockRedirectUri,
        mockClientId,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9090/api/v1/auth/google",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: mockAuthCode,
            redirectUri: mockRedirectUri,
            clientId: mockClientId,
          }),
        },
      );

      expect(calendarTokenStore.saveTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
          clientId: mockClientId,
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          accessToken: mockTokens.accessToken,
          refreshToken: mockTokens.refreshToken,
          clientId: mockClientId,
        }),
      );
    });

    it("throws error when connection fails", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(
        CalendarService.connectCalendar(
          mockAuthCode,
          mockRedirectUri,
          mockClientId,
        ),
      ).rejects.toThrow("Calendar connection failed: 400");

      expect(calendarTokenStore.saveTokens).not.toHaveBeenCalled();
    });
  });

  describe("fetchEvents", () => {
    it("successfully fetches events with valid tokens", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCalendarEvents),
      });

      const result = await CalendarService.fetchEvents(mockTokens);

      expect(ensureValidTokens).toHaveBeenCalledWith(
        mockTokens,
        calendarTokenStore,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9090/api/v1/calendar/events?",
        {
          headers: {
            Authorization: `Bearer ${mockTokens.accessToken}`,
          },
        },
      );

      expect(result).toEqual(mockCalendarEvents);
    });

    it("fetches events with time parameters", async () => {
      const timeMin = "2024-01-01T00:00:00Z";
      const timeMax = "2024-01-31T23:59:59Z";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCalendarEvents),
      });

      await CalendarService.fetchEvents(mockTokens, timeMin, timeMax);

      expect(mockFetch).toHaveBeenCalledWith(
        `http://localhost:9090/api/v1/calendar/events?timeMin=${encodeURIComponent(
          timeMin,
        )}&timeMax=${encodeURIComponent(timeMax)}`,
        {
          headers: {
            Authorization: `Bearer ${mockTokens.accessToken}`,
          },
        },
      );
    });

    it("clears tokens and throws error on 401 unauthorized", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(CalendarService.fetchEvents(mockTokens)).rejects.toThrow(
        "Calendar access expired. Please reconnect Google Calendar.",
      );

      expect(calendarTokenStore.clearTokens).toHaveBeenCalled();
    });

    it("throws error on other fetch failures", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });
      await expect(CalendarService.fetchEvents(mockTokens)).rejects.toThrow(
        "Failed to fetch calendar events: 500",
      );

      expect(calendarTokenStore.clearTokens).not.toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("clears calendar tokens", async () => {
      await CalendarService.disconnect();

      expect(calendarTokenStore.clearTokens).toHaveBeenCalled();
    });
  });
});
