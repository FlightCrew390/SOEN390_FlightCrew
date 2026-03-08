export interface CalendarEvent {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  start: string; // ISO 8601 datetime
  end: string; // ISO 8601 datetime
  allDay: boolean;
}
