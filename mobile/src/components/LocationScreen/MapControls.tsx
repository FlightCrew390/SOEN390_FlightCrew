import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable } from "react-native";
import { COLORS } from "../../constants";
import { SearchOrigin } from "../../state/MapUIState";
import styles from "../../styles/GoogleMaps";

type Panel =
  | "none"
  | "search"
  | "directions"
  | "steps"
  | "poi-results"
  | "room-results"
  | "indoor"
  | "room-info";

interface MapControlsProps {
  readonly panel: Panel;
  readonly searchOrigin: SearchOrigin;
  readonly hasLocation: boolean;
  readonly hasIndoorData: boolean;
  readonly onOpenSearch: () => void;
  readonly onCloseSearch: () => void;
  readonly onReturnToDirections: () => void;
  readonly onRecenter: () => void;
  readonly onOpenIndoor: () => void;
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
  hasIndoorData,
  onOpenSearch,
  onCloseSearch,
  onReturnToDirections,
  onRecenter,
  onOpenIndoor,
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
      {panel !== "directions" &&
        panel !== "poi-results" &&
        panel !== "room-results" &&
        panel !== "indoor" &&
        panel !== "room-info" && (
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

      {/* Indoor view toggle button */}
      {hasIndoorData &&
        (panel === "directions" ||
          panel === "steps" ||
          panel === "room-info") && (
          <Pressable
            style={{
              position: "absolute",
              bottom: 100,
              left: 16,
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 3,
            }}
            onPress={onOpenIndoor}
            accessibilityLabel="View indoor floor plan"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="floor-plan"
              size={30}
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
