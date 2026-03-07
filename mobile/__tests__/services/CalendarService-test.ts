import { CalendarService } from "../../src/services/CalendarService";
import { CalendarEvent } from "../../src/types/CalendarEvent";
import { AuthTokens } from "../../src/types/User";

import { CalendarTokenStorageService } from "../../src/services/CalendarTokenStorageService";

// Mock dependencies
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

jest.mock("../../src/services/CalendarTokenStorageService");
jest.mock("../../src/constants", () => ({
  API_CONFIG: {
    getBaseUrl: jest.fn(() => "http://localhost:9090/api"),
  },
}));

const mockedCalendarTokenStorage = CalendarTokenStorageService as jest.Mocked<
  typeof CalendarTokenStorageService
>;

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

  const mockRefreshedTokens: AuthTokens = {
    accessToken: "new-access-token",
    refreshToken: "new-refresh-token",
    expiresAt: Date.now() + 7200000, // 2 hours from now
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

      mockedCalendarTokenStorage.saveTokens.mockResolvedValue();

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

      expect(mockedCalendarTokenStorage.saveTokens).toHaveBeenCalledWith(
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

      expect(mockedCalendarTokenStorage.saveTokens).not.toHaveBeenCalled();
    });
  });

  describe("fetchEvents", () => {
    it("successfully fetches events with valid tokens", async () => {
      mockedCalendarTokenStorage.isExpired.mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCalendarEvents),
      });

      const result = await CalendarService.fetchEvents(mockTokens);

      expect(mockedCalendarTokenStorage.isExpired).toHaveBeenCalledWith(
        mockTokens,
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

      mockedCalendarTokenStorage.isExpired.mockReturnValue(false);

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

    it("refreshes tokens when expired before fetching events", async () => {
      const expiredTokens = {
        ...mockTokens,
        expiresAt: Date.now() - 1000, // Expired
      };

      mockedCalendarTokenStorage.isExpired.mockReturnValue(true);

      // Mock refresh response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: mockRefreshedTokens.accessToken,
          refreshToken: mockRefreshedTokens.refreshToken,
          expiresInSeconds: 7200,
        }),
      });

      // Mock events fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockCalendarEvents),
      });

      mockedCalendarTokenStorage.saveTokens.mockResolvedValue();

      const result = await CalendarService.fetchEvents(expiredTokens);

      expect(mockedCalendarTokenStorage.isExpired).toHaveBeenCalledWith(
        expiredTokens,
      );

      expect(mockFetch).toHaveBeenCalledTimes(2);

      // First call should be token refresh
      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        "http://localhost:9090/api/v1/auth/refresh",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: expiredTokens.refreshToken,
            clientId: expiredTokens.clientId,
          }),
        },
      );

      // Second call should be events fetch with refreshed token
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "http://localhost:9090/api/v1/calendar/events?",
        {
          headers: {
            Authorization: `Bearer ${mockRefreshedTokens.accessToken}`,
          },
        },
      );

      expect(mockedCalendarTokenStorage.saveTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: mockRefreshedTokens.accessToken,
          refreshToken: mockRefreshedTokens.refreshToken,
        }),
      );

      expect(result).toEqual(mockCalendarEvents);
    });

    it("clears tokens and throws error on 401 unauthorized", async () => {
      mockedCalendarTokenStorage.isExpired.mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      mockedCalendarTokenStorage.clearTokens.mockResolvedValue();

      await expect(CalendarService.fetchEvents(mockTokens)).rejects.toThrow(
        "Calendar access expired. Please reconnect Google Calendar.",
      );

      expect(mockedCalendarTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it("throws error on other fetch failures", async () => {
      mockedCalendarTokenStorage.isExpired.mockReturnValue(false);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(CalendarService.fetchEvents(mockTokens)).rejects.toThrow(
        "Failed to fetch calendar events: 500",
      );

      expect(mockedCalendarTokenStorage.clearTokens).not.toHaveBeenCalled();
    });
  });

  describe("disconnect", () => {
    it("clears calendar tokens", async () => {
      mockedCalendarTokenStorage.clearTokens.mockResolvedValue();

      await CalendarService.disconnect();

      expect(mockedCalendarTokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe("ensureValidTokens", () => {
    it("returns tokens when not expired", async () => {
      mockedCalendarTokenStorage.isExpired.mockReturnValue(false);

      const result = await (CalendarService as any).ensureValidTokens(
        mockTokens,
      );

      expect(result).toBe(mockTokens);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("refreshes tokens when expired", async () => {
      const expiredTokens = {
        ...mockTokens,
        expiresAt: Date.now() - 1000,
      };

      mockedCalendarTokenStorage.isExpired.mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: mockRefreshedTokens.accessToken,
          refreshToken: mockRefreshedTokens.refreshToken,
          expiresInSeconds: 7200,
        }),
      });

      mockedCalendarTokenStorage.saveTokens.mockResolvedValue();

      const result = await (CalendarService as any).ensureValidTokens(
        expiredTokens,
      );

      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:9090/api/v1/auth/refresh",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            refreshToken: expiredTokens.refreshToken,
            clientId: expiredTokens.clientId,
          }),
        },
      );

      expect(mockedCalendarTokenStorage.saveTokens).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: mockRefreshedTokens.accessToken,
          refreshToken: mockRefreshedTokens.refreshToken,
        }),
      );

      expect(result).toEqual(
        expect.objectContaining({
          accessToken: mockRefreshedTokens.accessToken,
          refreshToken: mockRefreshedTokens.refreshToken,
        }),
      );
    });

    it("clears tokens and throws error when refresh fails", async () => {
      const expiredTokens = {
        ...mockTokens,
        expiresAt: Date.now() - 1000,
      };

      mockedCalendarTokenStorage.isExpired.mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      mockedCalendarTokenStorage.clearTokens.mockResolvedValue();

      await expect(
        (CalendarService as any).ensureValidTokens(expiredTokens),
      ).rejects.toThrow(
        "Calendar access expired. Please reconnect Google Calendar.",
      );

      expect(mockedCalendarTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it("preserves refresh token when not provided in refresh response", async () => {
      const expiredTokens = {
        ...mockTokens,
        expiresAt: Date.now() - 1000,
      };

      mockedCalendarTokenStorage.isExpired.mockReturnValue(true);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          accessToken: mockRefreshedTokens.accessToken,
          // No refreshToken in response
          expiresInSeconds: 7200,
        }),
      });

      mockedCalendarTokenStorage.saveTokens.mockResolvedValue();

      const result = await (CalendarService as any).ensureValidTokens(
        expiredTokens,
      );

      expect(result.refreshToken).toBe(expiredTokens.refreshToken);
    });
  });
});
