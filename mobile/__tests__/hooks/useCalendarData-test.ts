import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCalendarData } from "../../src/hooks/useCalendarData";
import { CalendarService } from "../../src/services/CalendarService";
import { calendarTokenStore } from "../../src/services/TokenStore";
import { CalendarEvent } from "../../src/types/CalendarEvent";
import { AuthTokens } from "../../src/types/User";

jest.mock("../../src/services/CalendarService", () => ({
  CalendarService: {
    connectCalendar: jest.fn(
      (authCode: string, redirectUri: string, clientId: string) =>
        Promise.resolve({ mockTokens }),
    ),
    disconnect: jest.fn(() => Promise.resolve()),
    fetchEvents: jest.fn(
      (
        tokens: AuthTokens,
        timeMin?: string,
        timeMax?: string,
        signal?: AbortSignal,
      ) => Promise.resolve(mockEvents),
    ),
  },
}));

jest.mock("../../src/services/TokenStore", () => ({
  calendarTokenStore: {
    saveTokens: jest.fn((tokens: AuthTokens) => Promise.resolve()),
    getTokens: jest.fn(() => Promise.resolve(mockTokens)),
    clearTokens: jest.fn(() => Promise.resolve()),
    isExpired: jest.fn((tokens: AuthTokens) => {
      return false;
    }),
  },
}));

const mockTokens: AuthTokens = {
  accessToken: "access-token-123",
  refreshToken: "refresh-token-456",
  expiresAt: Date.now() + 3600000, // 1 hour from now
  clientId: "client-id-789",
};

const mockEvents: CalendarEvent[] = [
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
});

describe("useCalendarData", () => {
  it("restores calendar tokens on mount", async () => {
    renderHook(() => useCalendarData());

    await waitFor(() => {
      expect(calendarTokenStore.getTokens).toHaveBeenCalled();
    });
  });

  it("connects to calendar and saves tokens", async () => {
    const { result } = renderHook(() => useCalendarData());

    await act(async () => {
      await result.current.connectCalendar(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
    });

    expect(CalendarService.connectCalendar).toHaveBeenCalledWith(
      "auth-code",
      "redirect-uri",
      "client-id",
    );
    expect(result.current.isConnected).toBe(true);
  });

  it("disconnects from calendar and clears tokens", async () => {
    const { result } = renderHook(() => useCalendarData());

    // First connect to set some tokens
    await act(async () => {
      await result.current.connectCalendar(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
    });

    expect(result.current.isConnected).toBe(true);

    // Then disconnect
    await act(async () => {
      await result.current.disconnectCalendar();
    });

    expect(CalendarService.disconnect).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.events).toEqual([]);
  });

  it("handles errors when connecting to calendar", async () => {
    (CalendarService.connectCalendar as jest.Mock).mockRejectedValueOnce(
      new Error("Connection failed"),
    );

    const { result } = renderHook(() => useCalendarData());

    await act(async () => {
      await result.current.connectCalendar(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
    });

    expect(result.current.error).toBe(
      "Failed to connect Google Calendar: Connection failed",
    );
  });
});

describe("fetchEvents", () => {
  it("fetches events successfully", async () => {
    const { result } = renderHook(() => useCalendarData());

    await act(async () => {
      await result.current.connectCalendar(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
    });

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(CalendarService.fetchEvents).toHaveBeenCalledWith(
      {
        mockTokens,
      },
      undefined,
      undefined,
      undefined,
    );
  });

  it("handles errors when fetching events", async () => {
    (CalendarService.fetchEvents as jest.Mock).mockRejectedValueOnce(
      new Error("Fetch failed"),
    );

    const { result } = renderHook(() => useCalendarData());

    await act(async () => {
      await result.current.connectCalendar(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
    });

    await act(async () => {
      await result.current.fetchEvents();
    });

    expect(result.current.error).toBe(
      "Failed to fetch calendar events: Fetch failed",
    );
  });
});
