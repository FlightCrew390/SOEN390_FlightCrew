import { ScrollView, Text } from "react-native";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import EventItem from "./EventItem";

interface DailyEventListProps {
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  events: CalendarEvent[];
  /** Whether the currently selected date is today. */
  isToday: boolean;
  onEventPress: (event: CalendarEvent) => void;
  onDirections?: (event: CalendarEvent) => void;
}

/**
 * Find the first event that is either currently happening or upcoming
 * (i.e. its end time is still in the future). Returns the event id
 * or null if every event has already ended.
 */
function findUpcomingEventId(sortedEvents: CalendarEvent[]): string | null {
  const now = new Date();
  for (const event of sortedEvents) {
    if (event.allDay) continue;
    if (new Date(event.end).getTime() > now.getTime()) {
      return event.id;
    }
  }
  return null;
}

/**
 * Renders the daily event list with loading, error, empty, and
 * populated states. Extracted from Calendar to keep the main
 * component focused on layout and orchestration.
 */
export default function DailyEventList({
  isConnected,
  loading,
  error,
  events,
  isToday,
  onEventPress,
  onDirections,
}: Readonly<DailyEventListProps>) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  // Only highlight upcoming/current events when viewing today
  const upcomingId = isToday ? findUpcomingEventId(sorted) : null;

  let content;

  if (!isConnected) {
    content = (
      <Text style={styles.emptyText}>
        Connect Google Calendar to see your events
      </Text>
    );
  } else if (loading) {
    content = <Text style={styles.emptyText}>Loading events…</Text>;
  } else if (error) {
    content = <Text style={styles.errorText}>{error}</Text>;
  } else if (sorted.length > 0) {
    content = sorted.map((event) => (
      <EventItem
        key={event.id}
        event={event}
        isUpcoming={event.id === upcomingId}
        onPress={() => onEventPress(event)}
        onDirections={onDirections}
      />
    ));
  } else {
    content = (
      <Text style={styles.emptyText}>No events scheduled for this day</Text>
    );
  }

  return <ScrollView style={styles.events}>{content}</ScrollView>;
}
