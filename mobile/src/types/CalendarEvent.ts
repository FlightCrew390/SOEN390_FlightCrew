export interface CalendarEvent {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  allDay: boolean;
}

/** Represents a single calendar from the user's Google Calendar list. */
export interface CalendarInfo {
  id: string;
  summary: string;
  description: string | null;
  backgroundColor: string | null;
  primary: boolean;
}
