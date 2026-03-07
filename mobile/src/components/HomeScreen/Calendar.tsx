import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants";
import { useCalendar } from "../../contexts/CalendarContext";
import { useCalendarFetch } from "../../hooks/useCalendarFetch";
import { useCalendarUI } from "../../hooks/useCalendarUI";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import { formatTime } from "../../utils/formatHelper";
import EventDetailPanel from "./EventDetailPanel";
import WeeklyGrid from "./WeeklyGrid";

function WeekDayCard({
  date,
  isSelected,
  isToday,
  dayLetter,
  onPress,
}: Readonly<{
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  dayLetter: string;
  onPress: () => void;
}>) {
  return (
    <TouchableOpacity
      style={[
        styles.dayCard,
        isSelected && styles.dayCardSelected,
        !isSelected && isToday && styles.dayCardCurrent,
      ]}
      onPress={onPress}
      testID={`day-${date.getDate()}`}
    >
      <Text
        style={[
          styles.dayDate,
          isSelected && styles.dayDateSelected,
          !isSelected && isToday && styles.dayDateCurrent,
        ]}
      >
        {date.getDate()}
      </Text>
      <Text
        style={[
          styles.dayLetter,
          isSelected && styles.dayLetterSelected,
          !isSelected && isToday && styles.dayLetterCurrent,
        ]}
      >
        {dayLetter}
      </Text>
    </TouchableOpacity>
  );
}

function EventItem({
  event,
  onPress,
}: Readonly<{ event: CalendarEvent; onPress: () => void }>) {
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

/* ── Main component ── */

export default function Calendar() {
  const { events, loading, error, isConnected, fetchEvents } = useCalendar();
  const {
    weekDates,
    currentMonth,
    eventsForSelectedDate,
    eventsForWeek,
    viewMode,
    toggleViewMode,
    selectedEvent,
    selectEvent,
    clearSelectedEvent,
    getDayLetter,
    isDateSelected,
    isDateToday,
    setSelectedDate,
    navigateWeekBack,
    navigateWeekForward,
  } = useCalendarUI(events);

  // Auto-fetch events when week or connection state changes
  useCalendarFetch({ isConnected, weekDates, fetchEvents });

  const isWeekly = viewMode === "weekly";

  const sortedEvents = [...eventsForSelectedDate].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  );

  let dailyContent;
  if (!isConnected) {
    dailyContent = (
      <Text style={styles.emptyText}>
        Connect Google Calendar to see your events
      </Text>
    );
  } else if (loading) {
    dailyContent = <Text style={styles.emptyText}>Loading events…</Text>;
  } else if (error) {
    dailyContent = <Text style={styles.errorText}>{error}</Text>;
  } else if (sortedEvents.length > 0) {
    dailyContent = sortedEvents.map((event) => (
      <EventItem
        key={event.id}
        event={event}
        onPress={() => selectEvent(event)}
      />
    ));
  } else {
    dailyContent = (
      <Text style={styles.emptyText}>No events scheduled for this day</Text>
    );
  }

  return (
    <View style={styles.container} testID="calendar-component">
      <View style={styles.panel}>
        <Text style={styles.title}>My Schedule</Text>

        <View style={styles.headerRow}>
          <Text style={styles.monthText}>{currentMonth}</Text>
          <Pressable
            style={[
              styles.viewFullButton,
              isWeekly && styles.viewFullButtonActive,
            ]}
            onPress={toggleViewMode}
            accessibilityLabel={
              isWeekly ? "Switch to daily view" : "Switch to weekly view"
            }
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.viewFullButtonText,
                isWeekly && styles.viewFullButtonTextActive,
              ]}
            >
              {isWeekly ? "Daily View" : "Full Schedule"}
            </Text>
            <MaterialIcons
              name={isWeekly ? "view-agenda" : "calendar-view-week"}
              size={16}
              color={isWeekly ? COLORS.white : COLORS.textTertiary}
              style={styles.viewFullIcon}
            />
          </Pressable>
        </View>

        <View
          style={[
            styles.weekContainer,
            isWeekly && styles.weekContainerCompact,
          ]}
        >
          <TouchableOpacity
            style={[styles.chevronButton, styles.chevronLeft]}
            onPress={navigateWeekBack}
            testID="chevron-left"
          >
            <MaterialIcons
              name="chevron-left"
              size={28}
              color={COLORS.concordiaMaroon}
            />
          </TouchableOpacity>

          {!isWeekly && (
            <View style={styles.week}>
              {weekDates.map((date) => (
                <WeekDayCard
                  key={date.toDateString()}
                  date={date}
                  isSelected={isDateSelected(date)}
                  isToday={isDateToday(date)}
                  dayLetter={getDayLetter(date)}
                  onPress={() => setSelectedDate(date)}
                />
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.chevronButton, styles.chevronRight]}
            onPress={navigateWeekForward}
            testID="chevron-right"
          >
            <MaterialIcons
              name="chevron-right"
              size={28}
              color={COLORS.concordiaMaroon}
            />
          </TouchableOpacity>
        </View>

        {isWeekly ? (
          <WeeklyGrid
            weekDates={weekDates}
            eventsForWeek={eventsForWeek}
            getDayLetter={getDayLetter}
            isDateToday={isDateToday}
            onEventPress={selectEvent}
          />
        ) : (
          <ScrollView style={styles.events}>{dailyContent}</ScrollView>
        )}
      </View>

      <EventDetailPanel
        event={selectedEvent}
        onClose={clearSelectedEvent}
        onDirections={() => {
          // TODO: navigate to directions for event.location
          clearSelectedEvent();
        }}
      />
    </View>
  );
}
