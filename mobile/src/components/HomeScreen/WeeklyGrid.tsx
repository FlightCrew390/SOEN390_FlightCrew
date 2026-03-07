import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  HOUR_SLOT_HEIGHT,
  SCHEDULE_END_HOUR,
  SCHEDULE_START_HOUR,
} from "../../hooks/useCalendarUI";
import styles from "../../styles/Calendar";
import { CalendarEvent } from "../../types/CalendarEvent";
import { formatTime } from "../../utils/formatHelper";

function WeeklyDayHeader({
  weekDates,
  getDayLetter,
  isDateToday,
}: Readonly<{
  weekDates: Date[];
  getDayLetter: (date: Date) => string;
  isDateToday: (date: Date) => boolean;
}>) {
  return (
    <View style={styles.weeklyHeaderRow}>
      <View style={styles.weeklyTimeGutter} />
      {weekDates.map((date) => {
        const today = isDateToday(date);
        return (
          <View key={date.toDateString()} style={styles.weeklyDayHeaderCell}>
            <Text style={styles.weeklyDayHeaderLetter}>
              {getDayLetter(date)}
            </Text>
            {today ? (
              <View style={styles.weeklyTodayBadge}>
                <Text
                  style={[
                    styles.weeklyDayHeaderDate,
                    styles.weeklyDayHeaderToday,
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            ) : (
              <Text style={styles.weeklyDayHeaderDate}>{date.getDate()}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

function WeeklyEventBlock({
  event,
  onPress,
}: Readonly<{ event: CalendarEvent; onPress: () => void }>) {
  const startDate = new Date(event.start);
  const endDate = new Date(event.end);
  const startMinutes =
    startDate.getHours() * 60 +
    startDate.getMinutes() -
    SCHEDULE_START_HOUR * 60;
  const endMinutes =
    endDate.getHours() * 60 + endDate.getMinutes() - SCHEDULE_START_HOUR * 60;
  const durationMinutes = Math.max(endMinutes - startMinutes, 15);

  const topOffset = (startMinutes / 60) * HOUR_SLOT_HEIGHT;
  const height = (durationMinutes / 60) * HOUR_SLOT_HEIGHT;

  return (
    <Pressable
      style={[styles.weeklyEventBlock, { top: topOffset, height }]}
      testID={`weekly-event-${event.id}`}
      onPress={onPress}
    >
      <Text style={styles.weeklyEventSummary} numberOfLines={1}>
        {event.summary}
      </Text>
      {height > 28 && (
        <Text style={styles.weeklyEventTime} numberOfLines={1}>
          {formatTime(event.start)}
        </Text>
      )}
    </Pressable>
  );
}

function NowIndicator({ weekDates }: Readonly<{ weekDates: Date[] }>) {
  const now = new Date();
  const todayIndex = weekDates.findIndex(
    (d) => d.toDateString() === now.toDateString(),
  );
  if (todayIndex < 0) return null;

  const currentMinutes =
    now.getHours() * 60 + now.getMinutes() - SCHEDULE_START_HOUR * 60;
  if (
    currentMinutes < 0 ||
    currentMinutes > (SCHEDULE_END_HOUR - SCHEDULE_START_HOUR) * 60
  ) {
    return null;
  }

  const topOffset = (currentMinutes / 60) * HOUR_SLOT_HEIGHT;

  return (
    <>
      <View style={[styles.weeklyNowDot, { top: topOffset }]} />
      <View style={[styles.weeklyNowLine, { top: topOffset }]} />
    </>
  );
}

function formatHourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 || 12;
  return `${display} ${period}`;
}

interface WeeklyGridProps {
  readonly weekDates: Date[];
  readonly eventsForWeek: Map<number, CalendarEvent[]>;
  readonly getDayLetter: (date: Date) => string;
  readonly isDateToday: (date: Date) => boolean;
  readonly onEventPress: (event: CalendarEvent) => void;
}

export default function WeeklyGrid({
  weekDates,
  eventsForWeek,
  getDayLetter,
  isDateToday,
  onEventPress,
}: Readonly<WeeklyGridProps>) {
  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = SCHEDULE_START_HOUR; i < SCHEDULE_END_HOUR; i++) {
      h.push(i);
    }
    return h;
  }, []);

  return (
    <View style={styles.weeklyContainer}>
      <WeeklyDayHeader
        weekDates={weekDates}
        getDayLetter={getDayLetter}
        isDateToday={isDateToday}
      />
      <ScrollView
        style={styles.weeklyGridScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.weeklyGrid}>
          {hours.map((hour) => (
            <View key={hour} style={styles.weeklyHourRow}>
              <Text style={styles.weeklyHourLabel}>
                {formatHourLabel(hour)}
              </Text>
              <View style={styles.weeklyHourCells}>
                {weekDates.map((date) => (
                  <View
                    key={date.toDateString()}
                    style={styles.weeklyDayColumn}
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Event blocks overlaid on the grid */}
          {weekDates.map((_, dayIndex) => {
            const dayEvents = eventsForWeek.get(dayIndex) ?? [];
            if (dayEvents.length === 0) return null;

            const gutterWidth = 44;
            return dayEvents
              .filter((e) => !e.allDay)
              .map((event) => (
                <View
                  key={event.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: gutterWidth,
                    right: 0,
                  }}
                  pointerEvents="box-none"
                >
                  <View
                    style={{
                      position: "absolute",
                      left: `${(dayIndex / 7) * 100}%`,
                      width: `${100 / 7}%`,
                      top: 0,
                      bottom: 0,
                    }}
                    pointerEvents="box-none"
                  >
                    <WeeklyEventBlock
                      event={event}
                      onPress={() => onEventPress(event)}
                    />
                  </View>
                </View>
              ));
          })}

          <NowIndicator weekDates={weekDates} />
        </View>
      </ScrollView>
    </View>
  );
}
