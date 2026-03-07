import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCalendarData } from "../../src/hooks/useCalendarData";
import { CalendarService } from "../../src/services/CalendarService";
import { CalendarTokenStorageService } from "../../src/services/CalendarTokenStorageService";
import { CalendarEvent } from "../../src/types/CalendarEvent";
import { AuthTokens } from "../../src/types/User";

jest.mock("../../src/services/CalendarService");
jest.mock("../../src/services/CalendarTokenStorageService");

const mockedCalendarService = CalendarService as jest.Mocked<
  typeof CalendarService
>;
const mockedCalendarTokenStorage = CalendarTokenStorageService as jest.Mocked<
  typeof CalendarTokenStorageService
>;

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
  mockedCalendarTokenStorage.getTokens.mockResolvedValue(null);
});

describe("useCalendarData", () => {
  describe("initial state", () => {
    it("starts with disconnected state and empty events", () => {
      const { result } = renderHook(() => useCalendarData());

      expect(result.current.isConnected).toBe(false);
      expect(result.current.events).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("mount behavior", () => {
    it("restores calendar tokens from storage on mount", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(mockedCalendarTokenStorage.getTokens).toHaveBeenCalled();
    });

    it("remains disconnected when no tokens in storage", async () => {
      const { result } = renderHook(() => useCalendarData());

      // Wait for potential async operations
      await waitFor(() => {
        expect(mockedCalendarTokenStorage.getTokens).toHaveBeenCalled();
      });

      expect(result.current.isConnected).toBe(false);
    });
  });

  describe("connectCalendar", () => {
    it("successfully connects calendar and updates state", async () => {
      mockedCalendarService.connectCalendar.mockResolvedValue(mockTokens);

      const { result } = renderHook(() => useCalendarData());

      await act(async () => {
        await result.current.connectCalendar(
          "auth-code",
          "redirect-uri",
          "client-id",
        );
      });

      expect(mockedCalendarService.connectCalendar).toHaveBeenCalledWith(
        "auth-code",
        "redirect-uri",
        "client-id",
      );
      expect(result.current.isConnected).toBe(true);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles connection errors", async () => {
      const errorMessage = "Connection failed";
      mockedCalendarService.connectCalendar.mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => useCalendarData());

      await act(async () => {
        await result.current.connectCalendar(
          "auth-code",
          "redirect-uri",
          "client-id",
        );
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });

    it("handles non-Error connection errors", async () => {
      mockedCalendarService.connectCalendar.mockRejectedValue("string error");

      const { result } = renderHook(() => useCalendarData());

      await act(async () => {
        await result.current.connectCalendar(
          "auth-code",
          "redirect-uri",
          "client-id",
        );
      });

      expect(result.current.error).toBe("Failed to connect Google Calendar");
    });

    it("sets loading state during connection", async () => {
      let resolveConnect: (value: AuthTokens) => void;
      const connectPromise = new Promise<AuthTokens>((resolve) => {
        resolveConnect = resolve;
      });
      mockedCalendarService.connectCalendar.mockReturnValue(connectPromise);

      const { result } = renderHook(() => useCalendarData());

      act(() => {
        result.current.connectCalendar(
          "auth-code",
          "redirect-uri",
          "client-id",
        );
      });

      expect(result.current.loading).toBe(true);
      // @ts-ignore
      resolveConnect(mockTokens);
      await act(async () => {
        await connectPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });

  describe("disconnectCalendar", () => {
    it("successfully disconnects and clears state", async () => {
      // First connect
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedCalendarService.disconnect.mockResolvedValue();

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Now disconnect
      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(mockedCalendarService.disconnect).toHaveBeenCalled();
      expect(result.current.isConnected).toBe(false);
      expect(result.current.events).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it("clears state even when disconnect service fails", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedCalendarService.disconnect.mockRejectedValue(
        new Error("Disconnect failed"),
      );

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        await result.current.disconnectCalendar();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.events).toEqual([]);
    });
  });

  describe("fetchEvents", () => {
    it("fetches events successfully and updates state", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedCalendarService.fetchEvents.mockResolvedValue(mockEvents);

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        await result.current.fetchEvents(
          "2024-01-01T00:00:00Z",
          "2024-01-07T23:59:59Z",
        );
      });

      expect(mockedCalendarService.fetchEvents).toHaveBeenCalledWith(
        mockTokens,
        "2024-01-01T00:00:00Z",
        "2024-01-07T23:59:59Z",
      );
      expect(result.current.events).toEqual(mockEvents);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("does nothing when not connected", async () => {
      const { result } = renderHook(() => useCalendarData());

      await act(async () => {
        await result.current.fetchEvents();
      });

      expect(mockedCalendarService.fetchEvents).not.toHaveBeenCalled();
    });

    it("handles fetch errors", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);
      const errorMessage = "Fetch failed";
      mockedCalendarService.fetchEvents.mockRejectedValue(
        new Error(errorMessage),
      );

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        await result.current.fetchEvents();
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it("disconnects on expired token error", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedCalendarService.fetchEvents.mockRejectedValue(
        new Error("Calendar access expired. Please reconnect Google Calendar."),
      );

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        await result.current.fetchEvents();
      });

      expect(result.current.isConnected).toBe(false);
    });

    it("handles non-Error fetch errors", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);
      mockedCalendarService.fetchEvents.mockRejectedValue("string error");

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      await act(async () => {
        await result.current.fetchEvents();
      });

      expect(result.current.error).toBe("Failed to fetch calendar events");
    });

    it("sets loading state during fetch", async () => {
      mockedCalendarTokenStorage.getTokens.mockResolvedValue(mockTokens);

      let resolveFetch: (value: CalendarEvent[]) => void;
      const fetchPromise = new Promise<CalendarEvent[]>((resolve) => {
        resolveFetch = resolve;
      });
      mockedCalendarService.fetchEvents.mockReturnValue(fetchPromise);

      const { result } = renderHook(() => useCalendarData());

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      act(() => {
        result.current.fetchEvents();
      });

      expect(result.current.loading).toBe(true);
      // @ts-ignore
      resolveFetch(mockEvents);
      await act(async () => {
        await fetchPromise;
      });

      expect(result.current.loading).toBe(false);
    });
  });
});
