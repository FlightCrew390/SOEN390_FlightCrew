import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useReducer, useState } from "react";
import { Platform, Pressable, Text, View, StyleSheet } from "react-native";

import { COLORS } from "../../constants";
import { DEPARTURE_OPTIONS } from "../../constants/departureOptions";
import {
  departureTimePickerReducer,
  initialDepartureTimePickerState,
} from "../../reducers/departureTimePickerReducer";
import styles from "../../styles/DirectionPanel";
import { DepartureOption, DepartureTimeConfig } from "../../types/Directions";
import { formatDate, formatDateTime } from "../../utils/formatHelper";
import { getNextShuttleDefault } from "../../utils/shuttleUtils";

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
  const { showPicker, expanded } = state;
  const [tempDate, setTempDate] = useState<Date>(config.date);

  useEffect(() => {
    setTempDate(config.date);
  }, [config.date]);

  const handleOptionSelect = (option: DepartureOption) => {
    if (option === "now") {
      onConfigChange({ option: "now", date: new Date() });
      dispatch({ type: "COLLAPSE" });
      dispatch({ type: "HIDE_PICKER" });
    } else {
      setTempDate(config.date);
      onConfigChange({ option, date: config.date });
      dispatch({ type: "COLLAPSE" });
      dispatch({ type: "SHOW_PICKER" });
    }
  };

  const handleDateTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "ios" && date) {
      setTempDate(date);
    } else if (Platform.OS !== "ios") {
      dispatch({ type: "HIDE_PICKER" });
      if (event.type === "set" && date) {
        onConfigChange({ ...config, date });
      }
    }
  };

  const confirmIOSDate = () => {
    dispatch({ type: "HIDE_PICKER" });
    onConfigChange({ ...config, date: tempDate });
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
            {formatDate(config.date)}, {formatDateTime(config.date)}
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

      {/* Next weekday shortcut */}
      {config.option !== "now" && (
        <Pressable
          onPress={() =>
            onConfigChange({ ...config, date: getNextShuttleDefault() })
          }
          accessibilityLabel="Select next weekday"
          accessibilityRole="button"
        >
          <Text style={styles.departurePillTextShortcut}>
            Select next weekday
          </Text>
        </Pressable>
      )}

      {/* Past-time warning */}
      {isPastTime && (
        <Text style={styles.departurePastTimeWarning} accessibilityRole="alert">
          Please select a future date and time.
        </Text>
      )}

      {/* Native date & time picker */}
      {showPicker && (
        <View style={localStyles.pickerContainer}>
          <DateTimePicker
            testID="datetime-picker"
            value={tempDate}
            mode="datetime"
            minimumDate={new Date()}
            onChange={handleDateTimeChange}
            display={Platform.OS === "ios" ? "spinner" : "default"}
          />
          {Platform.OS === "ios" && (
            <Pressable
              style={localStyles.confirmButton}
              onPress={confirmIOSDate}
              accessibilityLabel="Confirm time"
              accessibilityRole="button"
            >
              <Text style={localStyles.confirmButtonText}>Confirm Time</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  pickerContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  confirmButton: {
    marginTop: 10,
    backgroundColor: COLORS.concordiaMaroon,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
