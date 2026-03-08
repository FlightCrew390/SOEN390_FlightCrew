import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../constants";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import styles from "../../styles/CalendarPickerPanelStyle";
import { CalendarInfo } from "../../types/CalendarEvent";

interface CalendarPickerPanelProps {
  readonly visible: boolean;
  readonly calendars: CalendarInfo[];
  readonly loading: boolean;
  readonly preSelectedId: string | null;
  readonly onConfirm: (calendarId: string) => void;
  readonly onDismiss: () => void;
}

function CalendarRow({
  calendar,
  isSelected,
  onPress,
}: Readonly<{
  calendar: CalendarInfo;
  isSelected: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable
      style={[styles.calendarRow, isSelected && styles.calendarRowSelected]}
      onPress={onPress}
      accessibilityLabel={`Select ${calendar.summary}`}
      accessibilityRole="radio"
      accessibilityState={{ selected: isSelected }}
    >
      <View
        style={[
          styles.colorDot,
          {
            backgroundColor: calendar.backgroundColor ?? COLORS.concordiaMaroon,
          },
        ]}
      />
      <View style={styles.calendarInfo}>
        <Text style={styles.calendarName}>{calendar.summary}</Text>
        {!!calendar.description && (
          <Text style={styles.calendarDescription} numberOfLines={1}>
            {calendar.description}
          </Text>
        )}
        {calendar.primary && <Text style={styles.primaryBadge}>Primary</Text>}
      </View>
      <View
        style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}
      >
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

export default function CalendarPickerPanel({
  visible,
  calendars,
  loading,
  preSelectedId,
  onConfirm,
  onDismiss,
}: Readonly<CalendarPickerPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);
  const [localSelection, setLocalSelection] = useState<string | null>(
    preSelectedId,
  );

  // Sync pre-selection when it changes (e.g. primary detected)
  if (preSelectedId && !localSelection) {
    setLocalSelection(preSelectedId);
  }

  if (!visible) return null;

  const handleConfirm = () => {
    if (localSelection) {
      onConfirm(localSelection);
    }
  };

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.panel, animatedStyle]}>
        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Select a Calendar</Text>
          <Text style={styles.headerSubtitle}>
            Choose which calendar to display events from
          </Text>
        </View>

        {/* ── Calendar list ── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.concordiaMaroon} />
            <Text style={styles.loadingText}>Loading calendars…</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listSection}
            showsVerticalScrollIndicator={false}
          >
            {calendars.map((cal, idx) => (
              <View key={cal.id}>
                {idx > 0 && <View style={styles.separator} />}
                <CalendarRow
                  calendar={cal}
                  isSelected={localSelection === cal.id}
                  onPress={() => setLocalSelection(cal.id)}
                />
              </View>
            ))}
          </ScrollView>
        )}

        {/* ── Actions ── */}
        <View style={styles.actionsSection}>
          <Pressable
            style={[
              styles.confirmButton,
              !localSelection && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirm}
            disabled={!localSelection}
            accessibilityLabel="Confirm calendar selection"
            accessibilityRole="button"
          >
            <MaterialIcons name="check" size={20} color={COLORS.white} />
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={onDismiss}
            accessibilityLabel="Skip calendar selection"
            accessibilityRole="button"
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
