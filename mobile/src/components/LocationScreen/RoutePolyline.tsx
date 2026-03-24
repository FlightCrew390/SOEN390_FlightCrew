import { Polyline } from "react-native-maps";
import { COLORS } from "../../constants";
import { RouteInfo, TRAVEL_MODE, TravelMode } from "../../types/Directions";

interface RoutePolylineProps {
  readonly route: RouteInfo | null;
  readonly travelMode: TravelMode | null;
}

/**
 * Returns the stroke color for a given travel mode.
 */
function getPolylineColor(travelMode: TravelMode | null): string {
  switch (travelMode) {
    case TRAVEL_MODE.SHUTTLE:
      return COLORS.concordiaMaroon; // Concordia red
    case TRAVEL_MODE.TRANSIT:
      return "#1E90FF"; // Light blue
    case TRAVEL_MODE.BICYCLE:
      return "#FF8C00"; // Orange
    case TRAVEL_MODE.DRIVE:
      return COLORS.mapPolylineWalk; // Dark blue
    case TRAVEL_MODE.WALK:
    default:
      return COLORS.mapPolylineWalk; // Dark blue
  }
}

/**
 * Returns the line dash pattern for a given travel mode.
 */
function getLineDashPattern(
  travelMode: TravelMode | null,
): number[] | undefined {
  switch (travelMode) {
    case TRAVEL_MODE.WALK:
      return [8, 6]; // Dotted line
    case TRAVEL_MODE.BICYCLE:
      return [12, 6]; // Dashed line
    case TRAVEL_MODE.SHUTTLE:
    case TRAVEL_MODE.TRANSIT:
    case TRAVEL_MODE.DRIVE:
      return undefined; // Solid line
    default:
      return [8, 6]; // Default to dotted line (same as walking)
  }
}

/**
 * Renders the navigation route polyline on the map.
 */
export default function RoutePolyline({
  route,
  travelMode,
}: Readonly<RoutePolylineProps>) {
  if (!route?.coordinates || route.coordinates.length < 2) return null;

  return (
    <Polyline
      coordinates={route.coordinates}
      strokeColor={getPolylineColor(travelMode)}
      strokeWidth={5}
      lineDashPattern={getLineDashPattern(travelMode)}
    />
  );
}
