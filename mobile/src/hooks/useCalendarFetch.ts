import { useEffect, useRef } from "react";

interface UseCalendarFetchParams {
  /** Whether the user has connected Google Calendar. */
  isConnected: boolean;
  /** The 7 dates currently displayed. Used to derive timeMin/timeMax. */
  weekDates: Date[];
  /** Callback into the context to fetch events for a time range. */
  fetchEvents: (
    timeMin?: string,
    timeMax?: string,
    signal?: AbortSignal,
  ) => Promise<void>;
  /** Whether the user is authenticated, used to trigger refetch on login. */
  isAuthenticated: boolean;
  /** The currently selected calendar ID — triggers refetch when changed. */
  selectedCalendarId?: string | null;
}

/**
 * Auto-fetches calendar events whenever the visible week, connection
 * state, authentication state, or selected calendar changes.
 *
 * The AbortController signal is threaded all the way down to the
 * underlying fetch call so that stale requests are genuinely cancelled.
 */
export function useCalendarFetch({
  isConnected,
  weekDates,
  fetchEvents,
  isAuthenticated,
  selectedCalendarId,
}: UseCalendarFetchParams) {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isConnected || !isAuthenticated || weekDates.length === 0) return;

    // Derive the ISO time bounds for the displayed week
    const timeMin = weekDates[0].toISOString();
    const lastDay = weekDates.at(-1)!;
    const weekEnd = new Date(lastDay);
    weekEnd.setDate(weekEnd.getDate() + 1); // end of last day
    const timeMax = weekEnd.toISOString();

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetchEvents(timeMin, timeMax, controller.signal).catch(() => {
      // Errors are surfaced via useCalendarData state
    });

    return () => {
      controller.abort();
    };
  }, [
    isConnected,
    isAuthenticated,
    weekDates,
    fetchEvents,
    selectedCalendarId,
  ]);
}
