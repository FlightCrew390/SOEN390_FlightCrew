import { Polyline } from "react-native-maps";
import { COLORS } from "../../constants";
import {
  RouteInfo,
  StepInfo,
  TRAVEL_MODE,
  TravelMode,
} from "../../types/Directions";

interface RoutePolylineProps {
  readonly route: RouteInfo | null;
  readonly travelMode: TravelMode | null;
}

/**
 * Determines the color for a step based on vehicle type or travel mode.
 */
function getStepColor(step: StepInfo): string {
  // If it's a transit step with vehicle details, color by vehicle type
  if (step.transitDetails) {
    const vehicleType = step.transitDetails.vehicleType?.toUpperCase();
    switch (vehicleType) {
      case "SUBWAY":
      case "RAIL":
        return "#FF6B35"; // Metro/Rail: Orange-red
      case "BUS":
        return "#1E90FF"; // Bus: Light blue
      case "TROLLEYBUS":
        return "#4169E1"; // Trolleybus: Royal blue
      default:
        return "#1E90FF"; // Default transit: Light blue
    }
  }

  // Check travel mode for non-transit steps
  if (step.travelMode) {
    const mode = step.travelMode.toUpperCase();
    switch (mode) {
      case "BICYCLE":
        return "#FF8C00"; // Cycling: Orange
      case "DRIVE":
        return "#40509F"; // Driving: Dark blue
      case "WALK":
      default:
        return "#40509F"; // Walking: Dark blue
    }
  }

  // Default: Dark blue for walking
  return "#40509F";
}

/**
 * Determines the line dash pattern for a step.
 */
function getStepLineDashPattern(step: StepInfo): number[] | undefined {
  // If it's a transit step, use solid line
  if (step.transitDetails) {
    return undefined;
  }

  // Check travel mode for non-transit steps
  if (step.travelMode) {
    const mode = step.travelMode.toUpperCase();
    switch (mode) {
      case "BICYCLE":
        return [12, 6]; // Cycling: Dashed line
      case "WALK":
        return [8, 6]; // Walking: Dotted line
      case "DRIVE":
      default:
        return undefined; // Driving: Solid line
    }
  }

  // Default: Dotted line for walking
  return [8, 6];
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
