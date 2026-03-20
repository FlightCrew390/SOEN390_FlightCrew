/**
 * Mock data used when EXPO_PUBLIC_E2E_MODE is set.
 * Provides a fake authenticated user, calendar tokens, calendar list,
 * and events so that E2E tests can exercise calendar-dependent flows
 * without a real Google OAuth session.
 */
import { CalendarEvent, CalendarInfo } from "../types/CalendarEvent";
import { AuthTokens, User } from "../types/User";

export const E2E_MODE =
  process.env.EXPO_PUBLIC_E2E_MODE === "true" ||
  process.env.EXPO_PUBLIC_E2E_MODE === "1";

export const MOCK_USER: User = {
  id: "e2e-user-001",
  email: "e2e-test@concordia.ca",
  displayName: "E2E Test User",
  avatarUrl: null,
  studentId: "40123456",
};

export const MOCK_AUTH_TOKENS: AuthTokens = {
  accessToken: "e2e-fake-access-token",
  refreshToken: "e2e-fake-refresh-token",
  expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
  clientId: "e2e-fake-client-id",
};

export const MOCK_CALENDARS: CalendarInfo[] = [
  {
    id: "primary-cal",
    summary: "School",
    description: "University schedule",
    backgroundColor: "#4285F4",
    primary: true,
  },
  {
    id: "secondary-cal",
    summary: "Personal",
    description: null,
    backgroundColor: "#34A853",
    primary: false,
  },
  {
    id: "work-cal",
    summary: "Work",
    description: "Part-time job schedule",
    backgroundColor: "#EA4335",
    primary: false,
  },
];

/**
 * Build mock events relative to today so the "upcoming event" logic
 * always finds a future event regardless of when the test runs.
 */
function buildMockEvents(): CalendarEvent[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  /** Helper: create an ISO string for today at a given hour/minute. */
  const todayAt = (hours: number, minutes = 0): string =>
    new Date(
      today.getTime() + hours * 3_600_000 + minutes * 60_000,
    ).toISOString();

  return [
    {
      id: "e2e-evt-1",
      summary: "SOEN 390 Lecture",
      description: "Software Engineering Team Design Project",
      location: "H 920",
      start: todayAt(now.getHours() + 1),
      end: todayAt(now.getHours() + 2, 15),
      allDay: false,
    },
    {
      id: "e2e-evt-2",
      summary: "COMP 346 Tutorial",
      description: "Operating Systems tutorial",
      location: "MB 3.270",
      start: todayAt(now.getHours() + 3),
      end: todayAt(now.getHours() + 4),
      allDay: false,
    },
    {
      id: "e2e-evt-3",
      summary: "Study Group",
      description: "Group study session",
      location: null,
      start: todayAt(now.getHours() + 5),
      end: todayAt(now.getHours() + 6),
      allDay: false,
    },
  ];
}

export const MOCK_EVENTS: CalendarEvent[] = buildMockEvents();
