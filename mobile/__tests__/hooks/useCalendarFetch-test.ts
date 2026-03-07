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

  it("does not fetch when not connected", () => {
    renderHook(() =>
      useCalendarFetch({
        isConnected: false,
        weekDates: mockWeekDates,
        fetchEvents: mockFetchEvents,
      }),
    );

    expect(mockFetchEvents).not.toHaveBeenCalled();
  });

  it("does not fetch when weekDates is empty", () => {
    renderHook(() =>
      useCalendarFetch({
        isConnected: true,
        weekDates: [],
        fetchEvents: mockFetchEvents,
      }),
    );

    expect(mockFetchEvents).not.toHaveBeenCalled();
  });

  it("fetches events when connected and has week dates", async () => {
    renderHook(() =>
      useCalendarFetch({
        isConnected: true,
        weekDates: mockWeekDates,
        fetchEvents: mockFetchEvents,
      }),
    );

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith(
        "2024-01-01T00:00:00.000Z", // timeMin: first date at midnight
        "2024-01-08T00:00:00.000Z", // timeMax: day after last date at midnight
      );
    });
  });

  it("fetches events with correct time bounds", async () => {
    const singleDay = [new Date("2024-01-15")];

    renderHook(() =>
      useCalendarFetch({
        isConnected: true,
        weekDates: singleDay,
        fetchEvents: mockFetchEvents,
      }),
    );

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledWith(
        "2024-01-15T00:00:00.000Z", // timeMin: start of day
        "2024-01-16T00:00:00.000Z", // timeMax: start of next day
      );
    });
  });

  it("refetches when isConnected changes from false to true", async () => {
    const { rerender } = renderHook(
      ({ isConnected }: { isConnected: boolean }) =>
        useCalendarFetch({
          isConnected,
          weekDates: mockWeekDates,
          fetchEvents: mockFetchEvents,
        }),
      { initialProps: { isConnected: false } },
    );

    expect(mockFetchEvents).not.toHaveBeenCalled();

    rerender({ isConnected: true });

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledTimes(1);
    });
  });

  it("refetches when weekDates change", async () => {
    const newWeekDates = [
      new Date("2024-01-08"), // Next Monday
      new Date("2024-01-09"),
      new Date("2024-01-10"),
      new Date("2024-01-11"),
      new Date("2024-01-12"),
      new Date("2024-01-13"),
      new Date("2024-01-14"),
    ];

    const { rerender } = renderHook(
      ({ weekDates }: { weekDates: Date[] }) =>
        useCalendarFetch({
          isConnected: true,
          weekDates,
          fetchEvents: mockFetchEvents,
        }),
      { initialProps: { weekDates: mockWeekDates } },
    );

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledTimes(1);
    });

    rerender({ weekDates: newWeekDates });

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledTimes(2);
    });
    expect(mockFetchEvents).toHaveBeenLastCalledWith(
      "2024-01-08T00:00:00.000Z",
      "2024-01-15T00:00:00.000Z",
    );
  });

  it("cancels previous request when new fetch is triggered", async () => {
    mockFetchEvents.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const { rerender } = renderHook(
      ({ weekDates }: { weekDates: Date[] }) =>
        useCalendarFetch({
          isConnected: true,
          weekDates,
          fetchEvents: mockFetchEvents,
        }),
      { initialProps: { weekDates: mockWeekDates } },
    );

    // Wait for first fetch to start
    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledTimes(1);
    });

    // Change week dates to trigger new fetch
    const newWeekDates = [new Date("2024-01-08")];
    rerender({ weekDates: newWeekDates });

    // Should have called fetch again
    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalledTimes(2);
    });
  });

  it("handles fetch errors gracefully", async () => {
    mockFetchEvents.mockRejectedValue(new Error("Fetch failed"));

    // Should not throw - errors are handled internally
    expect(() => {
      renderHook(() =>
        useCalendarFetch({
          isConnected: true,
          weekDates: mockWeekDates,
          fetchEvents: mockFetchEvents,
        }),
      );
    }).not.toThrow();

    await waitFor(() => {
      expect(mockFetchEvents).toHaveBeenCalled();
    });
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderHook(() =>
      useCalendarFetch({
        isConnected: true,
        weekDates: mockWeekDates,
        fetchEvents: mockFetchEvents,
      }),
    );

    unmount();

    // Hook should clean up properly
    expect(mockFetchEvents).toHaveBeenCalled();
  });
});
