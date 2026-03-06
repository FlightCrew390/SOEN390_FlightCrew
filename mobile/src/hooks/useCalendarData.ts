import { useCallback, useEffect, useState } from "react";
import { CalendarService } from "../services/CalendarService";
import { CalendarTokenStorageService } from "../services/CalendarTokenStorageService";
import { CalendarEvent } from "../types/CalendarEvent";
import { AuthTokens } from "../types/User";

export const useCalendarData = () => {
  const [calendarTokens, setCalendarTokens] = useState<AuthTokens | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isConnected = calendarTokens != null;

  // On mount, check if calendar tokens exist in storage
  useEffect(() => {
    let isMounted = true;

    const restoreCalendar = async () => {
      const stored = await CalendarTokenStorageService.getTokens();
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
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to connect Google Calendar",
        );
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
    }
  }, []);

  const fetchEvents = useCallback(
    async (timeMin?: string, timeMax?: string) => {
      if (!calendarTokens) return;

      try {
        setLoading(true);
        setError(null);
        const fetched = await CalendarService.fetchEvents(
          calendarTokens,
          timeMin,
          timeMax,
        );
        setEvents(fetched);
      } catch (err) {
        if (err instanceof Error && err.message.includes("expired")) {
          setCalendarTokens(null);
        }
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch calendar events",
        );
      } finally {
        setLoading(false);
      }
    },
    [calendarTokens],
  );

  return {
    isConnected,
    events,
    loading,
    error,
    connectCalendar,
    disconnectCalendar,
    fetchEvents,
  };
};
