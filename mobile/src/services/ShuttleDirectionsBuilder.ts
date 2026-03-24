import { DirectionsService } from "./DirectionsService";
import { ShuttleRouteResponse, ShuttleService } from "./ShuttleService";
import { RouteInfo, StepInfo, DepartureTimeConfig } from "../types/Directions";
import {
  ShuttleCampus,
  SHUTTLE_STOPS,
  getCampusForLocation,
  getCampusForBuilding,
  getNextDeparture,
  getPreviousDeparture,
  getDayOfWeek,
} from "../utils/shuttleUtils";
import type { Building } from "../types/Building";

/** Duration of the shuttle ride in seconds (21 minutes). */
const SHUTTLE_DURATION_SECONDS = 21 * 60;

/** Distance of the shuttle ride in meters (8.3 km). */
const SHUTTLE_DISTANCE_METERS = 8300;

/**
 * Builds a composite shuttle route consisting of:
 *   1. Walking from origin → shuttle stop
 *   2. Shuttle ride between campuses
 *   3. Walking from shuttle stop → destination
 */
export class ShuttleDirectionsBuilder {
  /**
   * Build a full shuttle directions route.
   *
   * @returns null if shuttle is unavailable or walking legs cannot be built.
   */
  static async buildShuttleRoute(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    departureConfig: DepartureTimeConfig,
    originBuilding?: Building | null,
    destBuilding?: Building | null,
  ): Promise<RouteInfo | null> {
    // Determine origin and destination campuses
    const originCampus = originBuilding
      ? getCampusForBuilding(originBuilding)
      : getCampusForLocation(originLat, originLng);
    const destCampus = destBuilding
      ? getCampusForBuilding(destBuilding)
      : getCampusForLocation(destLat, destLng);

    if (!originCampus || !destCampus || originCampus === destCampus)
      return null;

    const baseTime =
      departureConfig.option === "now" ? new Date() : departureConfig.date;

    // Get shuttle stops
    const originStop = SHUTTLE_STOPS[originCampus];
    const destStop = SHUTTLE_STOPS[destCampus];

    // Fetch schedule, route, and walking directions in parallel
    const [schedule, shuttleRoute, walkToStop, walkFromStop] =
      await Promise.all([
        ShuttleService.getSchedule(getDayOfWeek(baseTime)),
        ShuttleService.getRoute(),
        DirectionsService.fetchDirections(
          originLat,
          originLng,
          originStop.latitude,
          originStop.longitude,
          "WALK",
        ),
        DirectionsService.fetchDirections(
          destStop.latitude,
          destStop.longitude,
          destLat,
          destLng,
          "WALK",
        ),
      ]);

    if (schedule.no_service) return null;

    const { targetDep, waitTimeSeconds } = calculateTargetDeparture(
      departureConfig,
      baseTime,
      schedule,
      originCampus,
      walkToStop,
      walkFromStop,
    );

    if (!targetDep) return null;

    // Build shuttle leg
    const shuttleLeg = buildShuttleLeg(
      shuttleRoute,
      originCampus,
      targetDep.departureTime,
      waitTimeSeconds,
    );

    // Compose full route
    return composeRoute(walkToStop, shuttleLeg, walkFromStop, waitTimeSeconds);
  }
}

function calculateTargetDeparture(
  departureConfig: DepartureTimeConfig,
  baseTime: Date,
  schedule: any,
  originCampus: ShuttleCampus,
  walkToStop: RouteInfo | null,
  walkFromStop: RouteInfo | null,
) {
  let targetDep;
  let waitTimeSeconds = 0;

  if (departureConfig.option === "arrive_by") {
    const walkFromTimeMs = (walkFromStop?.durationSeconds ?? 0) * 1000;
    const shuttleRideMs = SHUTTLE_DURATION_SECONDS * 1000;
    const maxDepartureTime = new Date(
      baseTime.getTime() - walkFromTimeMs - shuttleRideMs,
    );

    targetDep = getPreviousDeparture(
      schedule.departures,
      originCampus,
      maxDepartureTime,
    );

    if (targetDep) {
      const waitTimeMs =
        maxDepartureTime.getTime() - targetDep.departureTime.getTime();
      if (waitTimeMs > 30 * 60 * 1000) {
        return { targetDep: null, waitTimeSeconds: 0 };
      }
      waitTimeSeconds = Math.max(0, Math.floor(waitTimeMs / 1000));
    }
  } else {
    const walkToTimeMs = (walkToStop?.durationSeconds ?? 0) * 1000;
    const arrivalAtStop = new Date(baseTime.getTime() + walkToTimeMs);

    targetDep = getNextDeparture(
      schedule.departures,
      originCampus,
      arrivalAtStop,
    );

    if (targetDep) {
      const waitTimeMs =
        targetDep.departureTime.getTime() - arrivalAtStop.getTime();
      if (waitTimeMs > 30 * 60 * 1000) {
        return { targetDep: null, waitTimeSeconds: 0 };
      }
      waitTimeSeconds = Math.max(0, Math.floor(waitTimeMs / 1000));
    }
  }

  return { targetDep, waitTimeSeconds };
}

/**
 * Creates the shuttle ride step/leg from backend route data.
 */
function buildShuttleLeg(
  route: ShuttleRouteResponse,
  originCampus: ShuttleCampus,
  departureTime: Date,
  waitTimeSeconds: number,
): RouteInfo {
  const coordinates =
    originCampus === "SGW" ? route.sgw_to_loyola : route.loyola_to_sgw;

  const arrivalTime = new Date(
    departureTime.getTime() + SHUTTLE_DURATION_SECONDS * 1000,
  );

  const originLabel =
    originCampus === "SGW" ? "SGW (Hall Building)" : "Loyola Campus";
  const destLabel =
    originCampus === "SGW" ? "Loyola Campus" : "SGW (Hall Building)";

  const waitMinutes = Math.round(waitTimeSeconds / 60);
  const waitText =
    waitMinutes > 0
      ? `Wait approx ${waitMinutes} mins for the shuttle. Then take`
      : "Take";

  const step: StepInfo = {
    distanceMeters: SHUTTLE_DISTANCE_METERS,
    durationSeconds: SHUTTLE_DURATION_SECONDS + waitTimeSeconds,
    instruction: `${waitText} the Concordia Shuttle from ${originLabel} to ${destLabel}`,
    maneuver: "STRAIGHT",
    coordinates,
    transitDetails: {
      departureStopName: originLabel,
      arrivalStopName: destLabel,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      lineName: "Concordia Shuttle",
      lineShortName: "Shuttle",
      vehicleType: "BUS",
      vehicleName: "Concordia Shuttle",
      stopCount: 1,
    },
  };

  return {
    coordinates,
    distanceMeters: SHUTTLE_DISTANCE_METERS,
    durationSeconds: SHUTTLE_DURATION_SECONDS + waitTimeSeconds,
    steps: [step],
  };
}

/**
 * Merges the three route legs into a single RouteInfo.
 */
function composeRoute(
  walkToStop: RouteInfo | null,
  shuttleLeg: RouteInfo,
  walkFromStop: RouteInfo | null,
  waitTimeSeconds: number,
): RouteInfo {
  const allCoords = [
    ...(walkToStop?.coordinates ?? []),
    ...shuttleLeg.coordinates,
    ...(walkFromStop?.coordinates ?? []),
  ];

  const allSteps = [
    ...(walkToStop?.steps ?? []),
    ...shuttleLeg.steps,
    ...(walkFromStop?.steps ?? []),
  ];

  const totalDistance =
    (walkToStop?.distanceMeters ?? 0) +
    shuttleLeg.distanceMeters +
    (walkFromStop?.distanceMeters ?? 0);

  const totalDuration =
    (walkToStop?.durationSeconds ?? 0) +
    shuttleLeg.durationSeconds +
    (walkFromStop?.durationSeconds ?? 0);

  return {
    coordinates: allCoords,
    distanceMeters: totalDistance,
    durationSeconds: totalDuration,
    steps: allSteps,
  };
}
