import { ActivityIndicator, Text, View } from "react-native";
import styles from "../../styles/GoogleMaps";

interface MapOverlaysProps {
  readonly isLoading: boolean;
  readonly isBuildingsLoading: boolean;
  readonly error: string | null;
}

/**
 * Renders the loading overlay and error overlay on top of the map.
 */
export default function MapOverlays({
  isLoading,
  isBuildingsLoading,
  error,
}: Readonly<MapOverlaysProps>) {
  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#8b2020" />
        <Text style={styles.loadingText}>
          {isBuildingsLoading
            ? "Loading buildings..."
            : "Getting your location..."}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorOverlay}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return null;
}
