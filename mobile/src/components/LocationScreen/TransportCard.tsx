import { Image, Pressable, Text } from "react-native";
import styles from "../../styles/DirectionPanel";

interface TransportCardProps {
  readonly icon: ReturnType<typeof require>;
  readonly label: string;
  readonly duration: string;
  readonly isActive: boolean;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}

/**
 * A single transport mode card (Walk, Bike, Transit, Drive, Shuttle)
 * displayed in the direction panel. Supports a disabled/greyed-out state.
 */
export default function TransportCard({
  icon,
  label,
  duration,
  isActive,
  onPress,
  disabled,
}: Readonly<TransportCardProps>) {
  return (
    <Pressable
      style={[
        styles.transportCard,
        isActive && styles.transportCardActive,
        disabled && styles.transportCardDisabled,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityLabel={`Get directions by ${label}`}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Image
        source={icon}
        style={[
          styles.transportIcon,
          isActive && styles.transportIconActive,
          disabled && styles.transportIconDisabled,
        ]}
        resizeMode="contain"
      />
      <Text
        style={[
          styles.transportTime,
          isActive && styles.transportTimeActive,
          disabled && styles.transportTimeDisabled,
        ]}
      >
        {disabled ? "N/A" : duration}
      </Text>
    </Pressable>
  );
}
