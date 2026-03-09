import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { ActivityIndicator, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/DirectionPanel";

interface RouteStatusDisplayProps {
  readonly loading: boolean;
  readonly error: string | null;
}

/**
 * Renders the route loading spinner or error message.
 * Returns null when there's nothing to display.
 */
export default function RouteStatusDisplay({
  loading,
  error,
}: Readonly<RouteStatusDisplayProps>) {
  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={COLORS.concordiaMaroon} />
        <Text style={styles.loadingText}>Calculating route…</Text>
      </View>
    );
  }

  if (error != null) {
    return (
      <View style={styles.errorRow}>
        <FontAwesome5
          name="exclamation-circle"
          size={14}
          color={COLORS.error}
        />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return null;
}
