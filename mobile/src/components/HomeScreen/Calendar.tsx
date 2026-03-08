import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { TabActions, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants";
import { useCalendar } from "../../contexts/CalendarContext";
import { useUser } from "../../contexts/UserContext";
import { useCalendarFetch } from "../../hooks/useCalendarFetch";
import { useCalendarUI } from "../../hooks/useCalendarUI";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import DailyEventList from "./DailyEventList";
import EventDetailPanel from "./EventDetailPanel";
import WeekDayCard from "./WeekDayCard";
import WeeklyGrid from "./WeeklyGrid";

export default function Calendar() {
  const {
    events,
    loading,
    error,
    isConnected,
    fetchEvents,
    selectedCalendarId,
  } = useCalendar();
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
    navigateToToday,
  } = useCalendarUI(events);

  const { isAuthenticated } = useUser();

  const navigation = useNavigation();

  // Auto-fetch events when week, auth, connection, or calendar selection changes
  useCalendarFetch({
    isConnected,
    weekDates,
    fetchEvents,
    isAuthenticated,
    selectedCalendarId,
  });

  /**
   * Navigate to the location/map tab and request directions to the
   * selected event's location. GoogleMaps will resolve the free-text
   * location to a building and open the directions panel.
   */
  const handleDirections = useCallback(
    (event: CalendarEvent) => {
      clearSelectedEvent();

      if (!event.location) return;

      const jumpAction = TabActions.jumpTo("location", {
        directionsTo: event.location,
      });
      navigation.dispatch(jumpAction);
    },
    [clearSelectedEvent, navigation],
  );

  const isWeekly = viewMode === "weekly";

  if (!isAuthenticated) {
    return (
      <View style={styles.container} testID="calendar-component">
        <View style={styles.panel}>
          <Text style={styles.title}>My Schedule</Text>
          <View style={styles.notAuthenticated}>
            <Text style={styles.emptyText}>
              Connect Google Calendar to see your events
            </Text>
            <Pressable
              style={styles.navToMenuButton}
              onPress={() => navigation.dispatch(TabActions.jumpTo("menu"))}
              accessibilityLabel="Go to menu to connect calendar"
              accessibilityRole="button"
            >
              <Text style={styles.navToMenuButtonText}>To Menu</Text>
              <MaterialIcons name="menu" size={16} color={COLORS.white} />
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="calendar-component">
      <View style={styles.panel}>
        <Text style={styles.title}>My Schedule</Text>

        {/* ── Header ── */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.todayButton}
            onPress={() => navigateToToday()}
            accessibilityLabel="Go to today's date"
            accessibilityRole="button"
          >
            <MaterialIcons
              name="today"
              size={16}
              color={COLORS.concordiaMaroon}
            />
          </Pressable>
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

        {/* ── Week strip ── */}
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

        {/* ── Event content ── */}
        {isWeekly ? (
          <WeeklyGrid
            weekDates={weekDates}
            eventsForWeek={eventsForWeek}
            getDayLetter={getDayLetter}
            isDateToday={isDateToday}
            onEventPress={selectEvent}
          />
        ) : (
          <DailyEventList
            isConnected={isConnected}
            loading={loading}
            error={error}
            events={eventsForSelectedDate}
            onEventPress={selectEvent}
          />
        )}
      </View>

      <EventDetailPanel
        event={selectedEvent}
        onClose={clearSelectedEvent}
        onDirections={() => {
          if (selectedEvent) handleDirections(selectedEvent);
        }}
      />
    </View>
  );
}
