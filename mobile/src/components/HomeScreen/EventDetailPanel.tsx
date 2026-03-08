import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Animated, Pressable, Text, View } from "react-native";
import { COLORS } from "../../constants";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import styles from "../../styles/EventDetailPanel";
import { CalendarEvent } from "../../types/CalendarEvent";
import { formatTime } from "../../utils/formatHelper";

interface EventDetailPanelProps {
  readonly event: CalendarEvent | null;
  readonly onClose: () => void;
  readonly onDirections: (event: CalendarEvent) => void;
}

function EventInfo({ event }: Readonly<{ event: CalendarEvent }>) {
  const startTime = formatTime(event.start);
  const endTime = formatTime(event.end);
  const dateLabel = new Date(event.start).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <Text style={styles.eventSummary}>{event.summary}</Text>

      <View style={styles.detailRow}>
        <MaterialIcons name="schedule" size={16} color={COLORS.white} />
        <Text style={styles.detailText}>
          {event.allDay ? "All day" : `${startTime} - ${endTime}`}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <MaterialIcons name="calendar-today" size={16} color={COLORS.white} />
        <Text style={styles.detailText}>{dateLabel}</Text>
      </View>

      {!!event.location && (
        <View style={styles.detailRow}>
          <MaterialIcons name="location-on" size={16} color={COLORS.white} />
          <Text style={styles.detailText}>{event.location}</Text>
        </View>
      )}

      {!!event.description && (
        <Text style={styles.descriptionText} numberOfLines={4}>
          {event.description}
        </Text>
      )}
    </>
  );
}

function AlertActions() {
  return (
    <>
      <Text style={styles.sectionLabel}>Reminders</Text>
      <View style={styles.alertRow}>
        <Pressable
          style={styles.alertButton}
          accessibilityLabel="Set first alert"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="notifications-none"
            size={18}
            color={COLORS.concordiaMaroon}
          />
          <Text style={styles.alertButtonText}>Alert 1</Text>
        </Pressable>
        <Pressable
          style={styles.alertButton}
          accessibilityLabel="Set second alert"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="notification-add"
            size={18}
            color={COLORS.concordiaMaroon}
          />
          <Text style={styles.alertButtonText}>Alert 2</Text>
        </Pressable>
      </View>
    </>
  );
}

export default function EventDetailPanel({
  event,
  onClose,
  onDirections,
}: Readonly<EventDetailPanelProps>) {
  const visible = event != null;
  const { animatedStyle } = usePanelAnimation(visible);

  if (!event) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.panel, animatedStyle]}>
        {/* ── Top half: maroon info card ── */}
        <View style={styles.infoSection}>
          <Pressable
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close event details"
            accessibilityRole="button"
          >
            <FontAwesome5 name="chevron-left" size={20} color={COLORS.white} />
          </Pressable>

          <EventInfo event={event} />
        </View>

        {/* ── Bottom half: actions ── */}
        <View style={styles.actionsSection}>
          <AlertActions />

          <Pressable
            style={styles.directionsButton}
            onPress={() => onDirections(event)}
            accessibilityLabel="Get directions to this event"
            accessibilityRole="button"
          >
            <MaterialIcons name="directions" size={20} color={COLORS.white} />
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
