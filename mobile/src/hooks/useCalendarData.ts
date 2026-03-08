import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarService } from "../services/CalendarService";
import { calendarTokenStore } from "../services/TokenStore";
import { CalendarEvent, CalendarInfo } from "../types/CalendarEvent";
import { AuthTokens } from "../types/User";
import { toErrorMessage } from "../utils/toErrorMessage";

export const useCalendarData = () => {
  const [calendarTokens, setCalendarTokens] = useState<AuthTokens | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Calendar picker state
  const [calendarList, setCalendarList] = useState<CalendarInfo[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(
    null,
  );
  const [showCalendarPicker, setShowCalendarPicker] = useState<boolean>(false);
  const [calendarListLoading, setCalendarListLoading] =
    useState<boolean>(false);

  const isConnected = calendarTokens != null;

  // Keep a ref so fetchEvents can read the latest tokens without
  // needing calendarTokens in its dependency array (keeps identity stable).
  const tokensRef = useRef(calendarTokens);
  tokensRef.current = calendarTokens;

  const selectedCalendarIdRef = useRef(selectedCalendarId);
  selectedCalendarIdRef.current = selectedCalendarId;

  // On mount, check if calendar tokens exist in storage
  useEffect(() => {
    let isMounted = true;

    const restoreCalendar = async () => {
      const stored = await calendarTokenStore.getTokens();
      if (isMounted && stored) {
        setCalendarTokens(stored);
      }
    };

    restoreCalendar();

    return () => {
      isMounted = false;
    };
  }, []);

  const connectCalendar = useCallback(
    async (authCode: string, redirectUri: string, clientId: string) => {
      try {
        setLoading(true);
        setError(null);
        const tokens = await CalendarService.connectCalendar(
          authCode,
          redirectUri,
          clientId,
        );
        setCalendarTokens(tokens);

        // Fetch calendar list and show picker
        setCalendarListLoading(true);
        try {
          const calendars = await CalendarService.fetchCalendarList(tokens);
          setCalendarList(calendars);
          // Default-select the primary calendar
          const primary = calendars.find((c) => c.primary);
          if (primary) {
            setSelectedCalendarId(primary.id);
          }
          setShowCalendarPicker(true);
        } catch {
          // If listing fails, continue without picking — events
          // will still load from the default (primary) calendar.
        } finally {
          setCalendarListLoading(false);
        }
      } catch (err) {
        setError(toErrorMessage(err, "Failed to connect Google Calendar"));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const disconnectCalendar = useCallback(async () => {
    try {
      await CalendarService.disconnect();
    } catch {
      // Always clear local state
    } finally {
      setCalendarTokens(null);
      setEvents([]);
      setError(null);
      setCalendarList([]);
      setSelectedCalendarId(null);
      setShowCalendarPicker(false);
    }
  }, []);

  /** Called when the user confirms their calendar choice in the picker. */
  const confirmCalendarSelection = useCallback((calendarId: string) => {
    setSelectedCalendarId(calendarId);
    setShowCalendarPicker(false);
  }, []);

  /** Dismiss picker without changing the selection. */
  const dismissCalendarPicker = useCallback(() => {
    setShowCalendarPicker(false);
  }, []);

  /**
   * Fetch events for the given time range.
   * Accepts an optional AbortSignal for cancellation by useCalendarFetch.
   *
   * Identity is stable (no deps) because we read tokens from a ref.
   */
  const fetchEvents = useCallback(
    async (timeMin?: string, timeMax?: string, signal?: AbortSignal) => {
      const tokens = tokensRef.current;
      if (!tokens) return;

      try {
        setLoading(true);
        setError(null);
        const fetched = await CalendarService.fetchEvents(
          tokens,
          timeMin,
          timeMax,
          signal,
          selectedCalendarIdRef.current ?? undefined,
        );

        // Don't update state if the request was aborted while in flight
        if (signal?.aborted) return;

        setEvents(fetched);
      } catch (err) {
        if (signal?.aborted) return;

        if (err instanceof Error && err.message.includes("expired")) {
          setCalendarTokens(null);
        }
        setError(toErrorMessage(err, "Failed to fetch calendar events"));
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [],
  );

  return {
    isConnected,
    events,
    loading,
    error,
    connectCalendar,
    disconnectCalendar,
    fetchEvents,
    // Calendar picker
    calendarList,
    calendarListLoading,
    selectedCalendarId,
    showCalendarPicker,
    confirmCalendarSelection,
    dismissCalendarPicker,
  };
};
