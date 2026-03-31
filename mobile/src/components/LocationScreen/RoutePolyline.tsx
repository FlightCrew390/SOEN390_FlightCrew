import { Polyline } from "react-native-maps";
import { COLORS } from "../../constants";
import { RouteInfo, TRAVEL_MODE, TravelMode } from "../../types/Directions";
import {
  getStepColor,
  getStepLineDashPattern,
} from "../../utils/pathTypeUtils";

interface RoutePolylineProps {
  readonly route: RouteInfo | null;
  readonly travelMode: TravelMode | null;
}

/**
 * Renders the navigation route polyline on the map with separate segments
 * for each step, colored by vehicle type or travel mode.
 */
export default function RoutePolyline({
  route,
  travelMode,
}: Readonly<RoutePolylineProps>) {
  if (!route || route.coordinates.length < 2) return null;

  // If there are no steps, render the entire route as one polyline
  if (!route.steps || route.steps.length === 0) {
    return (
      <Polyline
        coordinates={route.coordinates}
        strokeColor={getDefaultPolylineColor(travelMode)}
        strokeWidth={5}
        lineDashPattern={getDefaultLineDashPattern(travelMode)}
      />
    );
  }

  // For each step, render a separate polyline segment
  return (
    <>
      {route.steps.map((step, index) => (
        <Polyline
          key={`route-step-${index}`}
          coordinates={step.coordinates}
          strokeColor={getStepColor(step)}
          strokeWidth={5}
          lineDashPattern={getStepLineDashPattern(step)}
        />
      ))}
    </>
  );
}

/**
 * Default color when no step-level coloring is available.
 */
function getDefaultPolylineColor(travelMode: TravelMode | null): string {
  switch (travelMode) {
    case TRAVEL_MODE.SHUTTLE:
      return COLORS.concordiaMaroon; // Concordia red
    case TRAVEL_MODE.BICYCLE:
      return "#FF8C00"; // Orange for cycling
    case TRAVEL_MODE.DRIVE:
      return COLORS.mapPolylineWalk; // Dark blue for driving
    case TRAVEL_MODE.TRANSIT:
      return "#1E90FF"; // Light blue for transit
    case TRAVEL_MODE.WALK:
    default:
      return COLORS.mapPolylineWalk; // Dark blue for walking
  }
}

/**
 * Default line dash pattern when no step-level styling is available.
 */
function getDefaultLineDashPattern(
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
      return [8, 6]; // Default to dotted line
  }
}
