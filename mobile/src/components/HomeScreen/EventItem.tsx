import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, Text, View } from "react-native";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import { formatTime } from "../../utils/formatHelper";

interface EventItemProps {
  event: CalendarEvent;
  onPress: () => void;
}

export default function EventItem({
  event,
  onPress,
}: Readonly<EventItemProps>) {
  const startTime = formatTime(event.start);
  const endTime = formatTime(event.end);

  return (
    <Pressable
      style={styles.eventItem}
      testID={`event-${event.id}`}
      onPress={onPress}
    >
      <View style={styles.eventContent}>
        <Text style={styles.eventSummary}>{event.summary}</Text>
        <Text style={styles.eventDetails}>
          {event.allDay ? "All day" : `${startTime} - ${endTime}`}
        </Text>
        {!!event.location && (
          <Text style={styles.eventDetails}>{event.location}</Text>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={30} color="black" />
    </Pressable>
  );
}
