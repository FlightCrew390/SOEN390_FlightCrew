import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import { formatTime } from "../../utils/formatHelper";

interface EventItemProps {
  event: CalendarEvent;
  isUpcoming: boolean;
  onPress: () => void;
  onDirections?: (event: CalendarEvent) => void;
}

/** Pulsing button that navigates to the map tab for directions. */
function PulsingDirectionsButton({
  onPress,
}: Readonly<{ onPress: () => void }>) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleAnim]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="Get directions to this class"
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.directionsShortcut,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <MaterialIcons name="directions-walk" size={22} color={COLORS.white} />
      </Animated.View>
    </Pressable>
  );
}

/** Warning banner shown when event has missing location data. */
function EventErrorBanner() {
  return (
    <View style={styles.eventErrorBanner}>
      <MaterialIcons name="warning" size={14} color="#b45309" />
      <Text style={styles.eventErrorText}>
        Could not find location info. Please update the calendar event.
      </Text>
    </View>
  );
}

export default function EventItem({
  event,
  isUpcoming,
  onPress,
  onDirections,
}: Readonly<EventItemProps>) {
  const startTime = formatTime(event.start);
  const endTime = formatTime(event.end);
  const hasLocation = !!event.location;

  return (
    <Pressable
      style={[styles.eventItem, isUpcoming && styles.eventItemUpcoming]}
      testID={`event-${event.id}`}
      onPress={onPress}
    >
      <View style={styles.eventContent}>
        <Text style={styles.eventSummary}>{event.summary}</Text>
        <Text style={styles.eventDetails}>
          {event.allDay ? "All day" : `${startTime} - ${endTime}`}
        </Text>
        {hasLocation && (
          <Text style={styles.eventDetails}>{event.location}</Text>
        )}
        {!hasLocation && !event.allDay && <EventErrorBanner />}
      </View>

      {isUpcoming && hasLocation && onDirections ? (
        <PulsingDirectionsButton onPress={() => onDirections(event)} />
      ) : (
        <MaterialIcons name="chevron-right" size={30} color="black" />
      )}
    </Pressable>
  );
}
