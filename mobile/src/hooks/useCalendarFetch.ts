import { useEffect, useRef } from "react";

interface UseCalendarFetchParams {
  /** Whether the user has connected Google Calendar. */
  isConnected: boolean;
  /** The 7 dates currently displayed. Used to derive timeMin/timeMax. */
  weekDates: Date[];
  /** Callback into the context to fetch events for a time range. */
  fetchEvents: (timeMin?: string, timeMax?: string) => Promise<void>;
}

/**
 * Auto-fetches calendar events whenever the visible week or connection
 * state changes, following the useDirections pattern.
 */
export function useCalendarFetch({
  isConnected,
  weekDates,
  fetchEvents,
}: UseCalendarFetchParams) {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isConnected || weekDates.length === 0) return;

    // Derive the ISO time bounds for the displayed week
    const timeMin = weekDates[0].toISOString();
    const weekEnd = new Date(weekDates.at(weekDates.length - 1)!);
    weekEnd.setDate(weekEnd.getDate() + 1); // end of last day
    const timeMax = weekEnd.toISOString();

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    const doFetch = async () => {
      try {
        await fetchEvents(timeMin, timeMax);
      } catch {
        // Errors are handled by useCalendarData via its own state
      }
    };

    if (!cancelled) doFetch();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchEvents is stable from context
  }, [isConnected, weekDates]);
}
