import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Pressable } from "react-native";
import { COLORS } from "../../constants";
import { SearchOrigin } from "../../state/MapUIState";
import styles from "../../styles/GoogleMaps";

type Panel = "none" | "search" | "directions" | "steps" | "poi-results";

interface MapControlsProps {
  readonly panel: Panel;
  readonly searchOrigin: SearchOrigin;
  readonly hasLocation: boolean;
  readonly onOpenSearch: () => void;
  readonly onCloseSearch: () => void;
  readonly onReturnToDirections: () => void;
  readonly onRecenter: () => void;
}

function getSearchIcon(panel: Panel, searchOrigin: SearchOrigin): string {
  if (panel !== "search") return "search";
  if (searchOrigin === "directions") return "chevron-left";
  return "times";
}

/**
 * Renders the floating search button and recenter button on the map.
 */
export default function MapControls({
  panel,
  searchOrigin,
  hasLocation,
  onOpenSearch,
  onCloseSearch,
  onReturnToDirections,
  onRecenter,
}: Readonly<MapControlsProps>) {
  const handleSearchPress = () => {
    if (panel === "search") {
      if (searchOrigin === "directions") {
        onReturnToDirections();
      } else {
        onCloseSearch();
      }
    } else {
      onOpenSearch();
    }
  };

  return (
    <>
      {/* Search button */}
      {panel !== "directions" && panel !== "poi-results" && (
        <Pressable
          style={[
            styles.searchButton,
            panel === "search" && styles.searchButtonOpen,
          ]}
          onPress={handleSearchPress}
          accessibilityLabel={
            panel === "search" ? "Close search" : "Search campus buildings"
          }
          accessibilityRole="button"
        >
          <FontAwesome5
            name={getSearchIcon(panel, searchOrigin)}
            size={panel === "search" ? 30 : 28}
            color={COLORS.concordiaMaroon}
          />
        </Pressable>
      )}

      {/* Recenter button */}
      {hasLocation && (
        <Pressable
          style={styles.recenterButton}
          onPress={onRecenter}
          accessibilityLabel="Recenter map on my location"
          accessibilityRole="button"
        >
          <FontAwesome5
            name="location-arrow"
            size={22}
            color={COLORS.concordiaMaroon}
            style={{ transform: [{ rotate: "-45deg" }] }}
          />
        </Pressable>
      )}
    </>
  );
}
