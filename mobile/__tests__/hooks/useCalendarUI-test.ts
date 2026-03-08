import { act, renderHook } from "@testing-library/react-native";
import { useCalendarUI } from "../../src/hooks/useCalendarUI";
import { CalendarEvent } from "../../src/types/CalendarEvent";

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    summary: "Event 1",
    description: "Description 1",
    location: "Location 1",
    start: new Date(2024, 0, 7, 10, 0).toISOString(),
    end: new Date(2024, 0, 7, 11, 0).toISOString(),
    allDay: false,
  },
  {
    id: "2",
    summary: "Event 2",
    description: "Description 2",
    location: "Location 2",
    start: new Date(2024, 0, 8, 14, 0).toISOString(),
    end: new Date(2024, 0, 8, 15, 0).toISOString(),
    allDay: false,
  },
];

beforeAll(() => {
  const RealDate = Date;
  jest.spyOn(globalThis, "Date").mockImplementation(function (
    this: Date,
    ...args: any[]
  ) {
    if (args.length === 0) {
      return new RealDate(2024, 0, 7);
    }
    return new (Function.prototype.bind.apply(RealDate, [null, ...args]))();
  } as any);
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("useCalendarUI", () => {
  it("initializes with correct default values", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.selectedDate.toDateString()).toBe(
      new Date(2024, 0, 7).toDateString(),
    );
    expect(result.current.weekOffset).toBe(0);
    expect(result.current.viewMode).toBe("daily");
    expect(result.current.weekDates).toHaveLength(7);
    expect(result.current.weekDates[0].toDateString()).toBe(
      new Date(2024, 0, 7).toDateString(),
    );
    expect(result.current.weekDates[6].toDateString()).toBe(
      new Date(2024, 0, 13).toDateString(),
    );
  });

  it("navigates week forward and updates week dates", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    act(() => {
      result.current.navigateWeekForward();
    });

    expect(result.current.weekOffset).toBe(1);
    expect(result.current.weekDates[0].toDateString()).toBe(
      new Date(2024, 0, 14).toDateString(),
    );
  });

  it("navigates week back and updates week dates", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    act(() => {
      result.current.navigateWeekForward();
    });
    act(() => {
      result.current.navigateWeekBack();
    });

    expect(result.current.weekOffset).toBe(0);
    expect(result.current.weekDates[0].toDateString()).toBe(
      new Date(2024, 0, 7).toDateString(),
    );
  });

  it("filters events for selected date", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.eventsForSelectedDate).toHaveLength(1);
    expect(result.current.eventsForSelectedDate[0].id).toBe("1");
  });

  it("updates events when selected date changes", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    act(() => {
      result.current.setSelectedDate(new Date(2024, 0, 8));
    });

    expect(result.current.eventsForSelectedDate).toHaveLength(1);
    expect(result.current.eventsForSelectedDate[0].id).toBe("2");
  });

  it("returns empty events for a date with no events", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    act(() => {
      result.current.setSelectedDate(new Date(2024, 0, 9));
    });

    expect(result.current.eventsForSelectedDate).toHaveLength(0);
  });

  it("groups events by week day", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));
    const eventsForWeek: any = result.current.eventsForWeek;

    expect(eventsForWeek.get(0)).toHaveLength(1);
    expect(eventsForWeek.get(0)![0].id).toBe("1");
    expect(eventsForWeek.get(1)).toHaveLength(1);
    expect(eventsForWeek.get(1)![0].id).toBe("2");
    expect(eventsForWeek.get(2)).toHaveLength(0);
  });

  it("toggles view mode between daily and weekly", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.viewMode).toBe("daily");

    act(() => {
      result.current.toggleViewMode();
    });
    expect(result.current.viewMode).toBe("weekly");

    act(() => {
      result.current.toggleViewMode();
    });
    expect(result.current.viewMode).toBe("daily");
  });

  it("returns correct day letter for a date", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.getDayLetter(new Date(2024, 0, 7))).toBe("S");
    expect(result.current.getDayLetter(new Date(2024, 0, 8))).toBe("M");
  });

  it("identifies selected date correctly", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.isDateSelected(new Date(2024, 0, 7))).toBe(true);
    expect(result.current.isDateSelected(new Date(2024, 0, 8))).toBe(false);
  });

  it("identifies today correctly", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.isDateToday(new Date(2024, 0, 7))).toBe(true);
    expect(result.current.isDateToday(new Date(2024, 0, 8))).toBe(false);
  });

  it("selects and clears an event", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.selectedEvent).toBeNull();

    act(() => {
      result.current.selectEvent(sampleEvents[0]);
    });
    expect(result.current.selectedEvent).toBe(sampleEvents[0]);

    act(() => {
      result.current.clearSelectedEvent();
    });
    expect(result.current.selectedEvent).toBeNull();
  });

  it("displays the correct current month", () => {
    const { result } = renderHook(() => useCalendarUI(sampleEvents));

    expect(result.current.currentMonth).toBe("January 2024");
  });
});
