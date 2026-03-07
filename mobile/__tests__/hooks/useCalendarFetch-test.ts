import { renderHook, waitFor } from "@testing-library/react-native";
import { useCalendarFetch } from "../../src/hooks/useCalendarFetch";

describe("useCalendarFetch", () => {
  const mockFetchEvents = jest.fn();
  const mockWeekDates = [
    new Date("2024-01-01"), // Monday
    new Date("2024-01-02"), // Tuesday
    new Date("2024-01-03"), // Wednesday
    new Date("2024-01-04"), // Thursday
    new Date("2024-01-05"), // Friday
    new Date("2024-01-06"), // Saturday
    new Date("2024-01-07"), // Sunday
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchEvents.mockResolvedValue([]);
  });

  it("fetches events when connected and authenticated", async () => {
    renderHook(() =>
      useCalendarFetch({
        isConnected: true,
        weekDates: mockWeekDates,
        fetchEvents: mockFetchEvents,
        isAuthenticated: true,
      }),
    );

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith(
        "2024-01-01T00:00:00.000Z",
        "2024-01-08T00:00:00.000Z",
        expect.any(AbortSignal),
      );
    });
  });

  it("does not fetch when not connected", async () => {
    renderHook(() =>
      useCalendarFetch({
        isConnected: false,
        weekDates: mockWeekDates,
        fetchEvents: mockFetchEvents,
        isAuthenticated: true,
      }),
    );

    await waitFor(() => {
      expect(mockFetchEvents).not.toHaveBeenCalled();
    });
  });
});
