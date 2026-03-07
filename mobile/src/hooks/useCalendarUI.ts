import { useCallback, useMemo, useState } from "react";
import { CalendarEvent } from "../types/CalendarEvent";

export type CalendarViewMode = "daily" | "weekly";

export const SCHEDULE_START_HOUR = 8;
export const SCHEDULE_END_HOUR = 21;
export const HOUR_SLOT_HEIGHT = 60;

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

function buildWeekDates(weekOffset: number): Date[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek + weekOffset * 7);

  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    dates.push(date);
  }
  return dates;
}

function filterEventsByDate(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  const dateString = date.toDateString();
  return events.filter(
    (event) => new Date(event.start).toDateString() === dateString,
  );
}

/** Group events into a map keyed by day-of-week index (0–6). */
function groupEventsByWeekDay(
  events: CalendarEvent[],
  weekDates: Date[],
): Map<number, CalendarEvent[]> {
  const grouped = new Map<number, CalendarEvent[]>();
  for (let i = 0; i < weekDates.length; i++) {
    grouped.set(i, filterEventsByDate(events, weekDates[i]));
  }
  return grouped;
}

export function useCalendarUI(events: CalendarEvent[]) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("daily");

  const weekDates = useMemo(() => buildWeekDates(weekOffset), [weekOffset]);

  const currentMonth =
    weekDates.length > 0
      ? weekDates[0].toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "";

  const eventsForSelectedDate = useMemo(
    () => filterEventsByDate(events, selectedDate),
    [events, selectedDate],
  );

  const eventsForWeek = useMemo(
    () => groupEventsByWeekDay(events, weekDates),
    [events, weekDates],
  );

  const getDayLetter = useCallback(
    (date: Date): string => DAY_LETTERS[date.getDay()],
    [],
  );

  const isDateSelected = useCallback(
    (date: Date): boolean =>
      date.toDateString() === selectedDate.toDateString(),
    [selectedDate],
  );

  const isDateToday = useCallback(
    (date: Date): boolean => date.toDateString() === new Date().toDateString(),
    [],
  );

  const toggleViewMode = useCallback(
    () => setViewMode((prev) => (prev === "daily" ? "weekly" : "daily")),
    [],
  );

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );

  const selectEvent = useCallback(
    (event: CalendarEvent) => setSelectedEvent(event),
    [],
  );

  const clearSelectedEvent = useCallback(() => setSelectedEvent(null), []);

  // Use functional updates to avoid stale closure over weekOffset
  const navigateWeekBack = useCallback(
    () => setWeekOffset((prev) => prev - 1),
    [],
  );

  const navigateWeekForward = useCallback(
    () => setWeekOffset((prev) => prev + 1),
    [],
  );

  return {
    selectedDate,
    setSelectedDate,
    weekOffset,
    weekDates,
    currentMonth,
    eventsForSelectedDate,
    eventsForWeek,
    viewMode,
    toggleViewMode,
    selectedEvent,
    selectEvent,
    clearSelectedEvent,
    getDayLetter,
    isDateSelected,
    isDateToday,
    navigateWeekBack,
    navigateWeekForward,
  };
}
