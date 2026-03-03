import { DepartureTimeConfig } from "../types/Directions";

/**
 * Maps a Google Directions maneuver string to a MaterialIcons icon name.
 */
export function getManeuverIcon(maneuver: string): string {
  switch (maneuver) {
    case "DEPART":
      return "start";
    case "STRAIGHT":
      return "straight";
    case "RAMP_LEFT":
      return "ramp-left";
    case "RAMP_RIGHT":
      return "ramp-right";
    case "MERGE":
      return "merge";
    case "FORK_LEFT":
      return "fork-left";
    case "FORK_RIGHT":
      return "fork-right";
    case "FERRY":
      return "directions-ferry";
    case "TURN_LEFT":
      return "turn-left";
    case "TURN_SLIGHT_LEFT":
      return "turn-slight-left";
    case "TURN_SHARP_LEFT":
      return "turn-sharp-left";
    case "TURN_RIGHT":
      return "turn-right";
    case "TURN_SLIGHT_RIGHT":
      return "turn-slight-right";
    case "TURN_SHARP_RIGHT":
      return "turn-sharp-right";
    case "ROUNDABOUT_LEFT":
      return "roundabout-left";
    case "ROUNDABOUT_RIGHT":
      return "roundabout-right";
    case "UTURN_LEFT":
      return "u-turn-left";
    case "UTURN_RIGHT":
      return "u-turn-right";
    default:
      return "dot-circle";
  }
}

/** Parse an ISO time string; returns null on failure. */
export function parseTime(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Compute the departure time used for calculating step timestamps.
 * For "arrive_by", works backwards from the desired arrival time.
 */
export function getDepartureDate(
  config: DepartureTimeConfig,
  routeDurationSeconds: number,
): Date {
  if (config.option === "arrive_by") {
    return new Date(config.date.getTime() - routeDurationSeconds * 1000);
  }
  if (config.option === "depart_at") {
    return config.date;
  }
  return new Date(); // "now"
}
