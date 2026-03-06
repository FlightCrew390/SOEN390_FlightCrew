import { API_CONFIG } from "../constants";
import { CalendarEvent } from "../types/CalendarEvent";
import { AuthTokens } from "../types/User";
import { CalendarTokenStorageService } from "./CalendarTokenStorageService";

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
    const response = await fetch(`${API_BASE_URL}/v1/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: authCode, redirectUri, clientId }),
    });

    if (!response.ok) {
      throw new Error(`Calendar connection failed: ${response.status}`);
    }

    const data = await response.json();
    const tokens: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
      clientId,
    };

    await CalendarTokenStorageService.saveTokens(tokens);
    return tokens;
  }

  /**
   * Fetch calendar events from the backend.
   * The backend proxies the request to Google Calendar API.
   */
  static async fetchEvents(
    calendarTokens: AuthTokens,
    timeMin?: string,
    timeMax?: string,
  ): Promise<CalendarEvent[]> {
    const validTokens = await CalendarService.ensureValidTokens(calendarTokens);

    const params = new URLSearchParams();
    if (timeMin) params.set("timeMin", timeMin);
    if (timeMax) params.set("timeMax", timeMax);

    const url = `${API_BASE_URL}/v1/calendar/events?${params}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${validTokens.accessToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        await CalendarTokenStorageService.clearTokens();
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
    await CalendarTokenStorageService.clearTokens();
  }

  /**
   * Refresh calendar tokens if expired.
   */
  private static async ensureValidTokens(
    tokens: AuthTokens,
  ): Promise<AuthTokens> {
    if (!CalendarTokenStorageService.isExpired(tokens)) {
      return tokens;
    }

    const response = await fetch(`${API_BASE_URL}/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: tokens.refreshToken,
        clientId: tokens.clientId,
      }),
    });

    if (!response.ok) {
      await CalendarTokenStorageService.clearTokens();
      throw new Error(
        "Calendar access expired. Please reconnect Google Calendar.",
      );
    }

    const data = await response.json();
    const refreshed: AuthTokens = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? tokens.refreshToken,
      expiresAt: Date.now() + data.expiresInSeconds * 1000,
      clientId: tokens.clientId,
    };

    await CalendarTokenStorageService.saveTokens(refreshed);
    return refreshed;
  }
}
