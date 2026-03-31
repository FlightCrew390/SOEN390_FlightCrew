import { StepInfo } from "../types/Directions";
import { COLORS } from "../constants/index";
/**
 * Determines the color for a step based on vehicle type or travel mode.
 */
export function getStepColor(step: StepInfo): string {
  // If it's a transit step with vehicle details, color by vehicle type
  if (step.transitDetails) {
    const vehicleType = step.transitDetails.vehicleType?.toUpperCase();
    switch (vehicleType) {
      case "SUBWAY":
      case "RAIL":
        return COLORS.mapPolylineRail; // Metro/Rail: Orange-red
      case "BUS":
        return COLORS.mapPolylineBus; // Bus: Light blue
      case "TROLLEYBUS":
        return COLORS.mapPolylineTrolleybus; // Trolleybus: Royal blue
      default:
        return COLORS.mapPolylineBus; // Default transit: Light blue
    }
  }

  // Check travel mode for non-transit steps
  if (step.travelMode) {
    const mode = step.travelMode.toUpperCase();
    switch (mode) {
      case "BICYCLE":
        return COLORS.mapPolylineBicycle; // Cycling: Orange
      case "DRIVE":
        return COLORS.mapPolylineDrive; // Driving: Dark blue
      case "WALK":
      default:
        return COLORS.mapPolylineWalk; // Walking: Dark blue
    }
  }

  // Default: Dark blue for walking
  return COLORS.mapPolylineWalk;
}

/**
 * Determines the line dash pattern for a step.
 */
export function getStepLineDashPattern(step: StepInfo): number[] | undefined {
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
