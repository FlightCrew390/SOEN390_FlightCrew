import { ScrollView, Text } from "react-native";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import EventItem from "./EventItem";

interface DailyEventListProps {
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  events: CalendarEvent[];
  onEventPress: (event: CalendarEvent) => void;
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
  onEventPress,
}: Readonly<DailyEventListProps>) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

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
        onPress={() => onEventPress(event)}
      />
    ));
  } else {
    content = (
      <Text style={styles.emptyText}>No events scheduled for this day</Text>
    );
  }

  return <ScrollView style={styles.events}>{content}</ScrollView>;
}
