import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useCallback } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/DirectionPanel";
import { TravelMode } from "../../types/Directions";

interface TransportCardProps {
  readonly icon?: ReturnType<typeof require>;
  readonly iconName?: string;
  readonly label: string;
  readonly duration: string;
  readonly isActive: boolean;
  readonly onPress?: () => void;
  readonly mode?: TravelMode;
  readonly onSelectMode?: (mode: TravelMode) => void;
}

/**
 * A single transport mode card (Walk, Bike, Transit, Drive, Shuttle)
 * displayed in the direction panel.
 */
export default function TransportCard({
  icon,
  iconName,
  label,
  duration,
  isActive,
  onPress,
  mode,
  onSelectMode,
}: Readonly<TransportCardProps>) {
  const handlePress = useCallback(() => {
    if (mode != null && onSelectMode != null) {
      onSelectMode(mode);
    } else {
      onPress?.();
    }
  }, [mode, onSelectMode, onPress]);

  const iconColor = isActive ? COLORS.concordiaMaroon : "#6B6B6B";

  return (
    <Pressable
      style={[styles.transportCard, isActive && styles.transportCardActive]}
      onPress={handlePress}
      accessibilityLabel={`Get directions by ${label}`}
      accessibilityRole="button"
    >
      {iconName == null ? (
        icon != null && (
          <Image
            source={icon}
            style={[
              styles.transportIcon,
              isActive && styles.transportIconActive,
            ]}
            resizeMode="contain"
          />
        )
      ) : (
        <View style={styles.transportIconWrap}>
          <FontAwesome5
            name={iconName as "bus"}
            size={24}
            color={iconColor}
            solid
          />
        </View>
      )}
      <Text
        style={[styles.transportTime, isActive && styles.transportTimeActive]}
      >
        {duration}
      </Text>
    </Pressable>
  );
}
