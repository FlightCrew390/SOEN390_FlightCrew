import { Image, Pressable, Text } from "react-native";
import styles from "../../styles/DirectionPanel";

interface TransportCardProps {
  readonly icon: ReturnType<typeof require>;
  readonly label: string;
  readonly duration: string;
  readonly isActive: boolean;
  readonly onPress: () => void;
}

/**
 * A single transport mode card (Walk, Bike, Transit, Drive)
 * displayed in the direction panel.
 */
export default function TransportCard({
  icon,
  label,
  duration,
  isActive,
  onPress,
}: Readonly<TransportCardProps>) {
  return (
    <Pressable
      style={[styles.transportCard, isActive && styles.transportCardActive]}
      onPress={onPress}
      accessibilityLabel={`Get directions by ${label}`}
      accessibilityRole="button"
    >
      <Image
        source={icon}
        style={[styles.transportIcon, isActive && styles.transportIconActive]}
        resizeMode="contain"
      />
      <Text
        style={[styles.transportTime, isActive && styles.transportTimeActive]}
      >
        {duration}
      </Text>
    </Pressable>
  );
}
