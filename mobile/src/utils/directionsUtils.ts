import type MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { ComponentProps } from "react";
import { Building } from "../types/Building";
import { DepartureTimeConfig, StepInfo } from "../types/Directions";
import { IndoorRoom } from "../types/IndoorRoom";
import { calculateDistance } from "./buildingDetection";
import { formatDistance } from "./formatHelper";

type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];

interface LatLng {
  latitude: number;
  longitude: number;
}

function getBuildingDisplayName(building: Building): string {
  return building.buildingName ?? building.buildingCode;
}

/**
 * Returns the effective outdoor origin coordinates for direction calculations.
 * Classroom starts currently resolve to their building coordinates.
 */
export function getDirectionOriginCoords(
  startBuilding: Building | null | undefined,
  startRoom: IndoorRoom | null | undefined,
  userLocation: LatLng | null | undefined,
): LatLng | null {
  if (startBuilding) {
    return {
      latitude: startBuilding.latitude,
      longitude: startBuilding.longitude,
    };
  }

  // A room-only start without a mapped building has no outdoor coordinates yet.
  if (startRoom) {
    return userLocation ?? null;
  }

  return userLocation ?? null;
}

export function getStartLocationText(
  startBuilding: Building | null | undefined,
  startRoom: IndoorRoom | null | undefined,
): string {
  if (!startBuilding) {
    return "Starting from your current location";
  }

  if (startRoom?.label) {
    return `Starting at ${startRoom.label} (${getBuildingDisplayName(startBuilding)})`;
  }

  return `Starting at ${getBuildingDisplayName(startBuilding)}`;
}

export function getBirdsEyeDistanceText(
  origin: LatLng | null | undefined,
  destination: LatLng | null | undefined,
): string {
  if (!origin || !destination) return "-- m";

  const distanceMeters = calculateDistance(
    origin.latitude,
    origin.longitude,
    destination.latitude,
    destination.longitude,
  );

  return formatDistance(distanceMeters);
}

/**
 * Maps a Google Directions maneuver string to a MaterialIcons icon name.
 */
export function getManeuverIcon(maneuver: string): MaterialIconName {
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
    case "ELEVATOR":
      return "elevator";
    case "STAIRS":
      return "stairs";
    case "ARRIVE":
      return "place";
    default:
      return "navigation";
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

export interface StepTimeline {
  visibleSteps: StepInfo[];
  stepTimes: Date[];
  departureDate: Date;
  arrivalDate: Date;
}

/**
 * Filters visible steps and computes a schedule-aware timestamp for each one.
 * For transit steps, the running clock snaps to real Google schedule times.
 * Returns the visible steps, their timestamps, and the overall departure/arrival dates.
 */
export function computeStepTimeline(
  steps: StepInfo[],
  initialDeparture: Date,
): StepTimeline {
  const visibleSteps = steps.filter((step) => step.instruction.length > 0);
  const stepTimes: Date[] = [];
  let clock = initialDeparture.getTime();

  for (const step of visibleSteps) {
    const realDep = parseTime(step.transitDetails?.departureTime);
    if (realDep) {
      clock = realDep.getTime();
    }
    stepTimes.push(new Date(clock));

    const realArr = parseTime(step.transitDetails?.arrivalTime);
    if (realArr) {
      clock = realArr.getTime();
    } else {
      clock += step.durationSeconds * 1000;
    }
  }

  const departureDate = stepTimes.length > 0 ? stepTimes[0] : initialDeparture;
  const arrivalDate = new Date(clock);

  return { visibleSteps, stepTimes, departureDate, arrivalDate };
}
