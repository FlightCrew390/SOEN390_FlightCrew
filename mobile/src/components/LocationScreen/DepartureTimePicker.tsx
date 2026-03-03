import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useReducer } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { COLORS } from "../../constants";
import { DEPARTURE_OPTIONS } from "../../constants/departureOptions";
import {
  departureTimePickerReducer,
  initialDepartureTimePickerState,
} from "../../reducers/departureTimePickerReducer";
import styles from "../../styles/DirectionPanel";
import { DepartureOption, DepartureTimeConfig } from "../../types/Directions";
import { formatDate, formatTime } from "../../utils/formatHelper";

interface DepartureTimePickerProps {
  readonly config: DepartureTimeConfig;
  readonly onConfigChange: (config: DepartureTimeConfig) => void;
}

export default function DepartureTimePicker({
  config,
  onConfigChange,
}: DepartureTimePickerProps) {
  const [state, dispatch] = useReducer(
    departureTimePickerReducer,
    initialDepartureTimePickerState,
  );
  const { showDatePicker, showTimePicker, expanded } = state;

  const handleOptionSelect = (option: DepartureOption) => {
    if (option === "now") {
      onConfigChange({ option: "now", date: new Date() });
    } else {
      onConfigChange({ option, date: config.date });
    }
    dispatch({ type: "COLLAPSE" });
  };

  const handleDateChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") dispatch({ type: "HIDE_DATE_PICKER" });
    if (date) {
      const merged = new Date(config.date);
      merged.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      onConfigChange({ ...config, date: merged });
    }
  };

  const handleTimeChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") dispatch({ type: "HIDE_TIME_PICKER" });
    if (date) {
      const merged = new Date(config.date);
      merged.setHours(date.getHours(), date.getMinutes(), 0, 0);
      onConfigChange({ ...config, date: merged });
    }
  };

  const isPastTime =
    config.option !== "now" && config.date.getTime() < Date.now();

  let activeLabel: string;
  if (config.option === "now") {
    activeLabel = "Leave now";
  } else if (config.option === "depart_at") {
    activeLabel = "Depart at";
  } else {
    activeLabel = "Arrive by";
  }

  return (
    <View style={styles.departureWrapper}>
      {/* Main toggle button */}
      <Pressable
        style={styles.departureToggle}
        onPress={() => dispatch({ type: "TOGGLE_EXPANDED" })}
        accessibilityLabel="Change departure time"
        accessibilityRole="button"
      >
        <FontAwesome5 name="clock" size={13} color={COLORS.concordiaMaroon} />
        <Text style={styles.departureToggleText}>{activeLabel}</Text>
        {config.option !== "now" && (
          <Text style={styles.departureToggleTime}>
            {formatDate(config.date)}, {formatTime(config.date)}
          </Text>
        )}
        <FontAwesome5
          name={expanded ? "chevron-up" : "chevron-down"}
          size={10}
          color={COLORS.textSecondary}
        />
      </Pressable>

      {/* Expanded option pills */}
      {expanded && (
        <View
          style={styles.departureOptions}
          accessibilityLabel="Departure time options"
        >
          {DEPARTURE_OPTIONS.map(({ value, label }) => (
            <Pressable
              key={value}
              style={[
                styles.departurePill,
                config.option === value && styles.departurePillActive,
              ]}
              onPress={() => handleOptionSelect(value)}
              accessibilityLabel={label}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.departurePillText,
                  config.option === value && styles.departurePillTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Date & time buttons (visible when a timed option is selected) */}
      {config.option !== "now" && (
        <View style={styles.departureDateTimeRow}>
          <Pressable
            style={styles.departureDateBtn}
            onPress={() => dispatch({ type: "SHOW_DATE_PICKER" })}
            accessibilityLabel="Select date"
            accessibilityRole="button"
          >
            <FontAwesome5 name="calendar-alt" size={13} color="#555" />
            <Text style={styles.departureDateText}>
              {formatDate(config.date)}
            </Text>
          </Pressable>
          <Pressable
            style={styles.departureDateBtn}
            onPress={() => dispatch({ type: "SHOW_TIME_PICKER" })}
            accessibilityLabel="Select time"
            accessibilityRole="button"
          >
            <FontAwesome5 name="clock" size={13} color="#555" />
            <Text style={styles.departureDateText}>
              {formatTime(config.date)}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Past-time warning */}
      {isPastTime && (
        <Text style={styles.departurePastTimeWarning} accessibilityRole="alert">
          Please select a future date and time.
        </Text>
      )}

      {/* Native date picker */}
      {showDatePicker && (
        <DateTimePicker
          testID="date-picker"
          value={config.date}
          mode="date"
          minimumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Native time picker */}
      {showTimePicker && (
        <DateTimePicker
          testID="time-picker"
          value={config.date}
          mode="time"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
}
