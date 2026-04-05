import { API_CONFIG } from "../constants";
import { CalendarEvent, CalendarInfo } from "../types/CalendarEvent";
import { AuthTokens } from "../types/User";
import { ensureValidTokens } from "./EnsureValidTokens";
import { calendarTokenStore } from "./TokenStore";
import { GoogleAuthBase } from "./GoogleAuthBase";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export class CalendarService {
  /**
   * Exchange a calendar-scoped authorization code for tokens via the backend.
   */
  static async connectCalendar(
    authCode: string,
    redirectUri: string,
    clientId: string,
  ): Promise<AuthTokens> {
    const tokens = await GoogleAuthBase.exchangeCodeForTokens(
      authCode,
      redirectUri,
      clientId,
      "Calendar connection failed",
    );

    await calendarTokenStore.saveTokens(tokens);
    return tokens;
  }

  /**
   * Fetch the list of calendars the user has access to.
   */
  static async fetchCalendarList(
    calendarTokens: AuthTokens,
  ): Promise<CalendarInfo[]> {
    const validTokens = await ensureValidTokens(
      calendarTokens,
      calendarTokenStore,
    );

    const url = `${API_BASE_URL}/v1/calendar/list`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${validTokens.accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await calendarTokenStore.clearTokens();
        throw new Error(
          "Calendar access expired. Please reconnect Google Calendar.",
        );
      }
      throw new Error(`Failed to fetch calendar list: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch calendar events from the backend.
   * Accepts an optional AbortSignal so callers can cancel in-flight requests.
   */
  static async fetchEvents(
    calendarTokens: AuthTokens,
    timeMin?: string,
    timeMax?: string,
    signal?: AbortSignal,
    calendarId?: string,
  ): Promise<CalendarEvent[]> {
    const validTokens = await ensureValidTokens(
      calendarTokens,
      calendarTokenStore,
    );

    const params = new URLSearchParams();
    if (timeMin) params.set("timeMin", timeMin);
    if (timeMax) params.set("timeMax", timeMax);
    if (calendarId) params.set("calendarId", calendarId);

    const url = `${API_BASE_URL}/v1/calendar/events?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${validTokens.accessToken}`,
      },
      signal,
    });

    if (!response.ok) {
      if (response.status === 401) {
        await calendarTokenStore.clearTokens();
        throw new Error(
          "Calendar access expired. Please reconnect Google Calendar.",
        );
      }
      throw new Error(`Failed to fetch calendar events: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Disconnect Google Calendar — clear stored calendar tokens.
   */
  static async disconnect(): Promise<void> {
    await calendarTokenStore.clearTokens();
  }
}
