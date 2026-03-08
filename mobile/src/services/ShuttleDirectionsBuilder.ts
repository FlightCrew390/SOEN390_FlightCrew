import { DirectionsService } from "./DirectionsService";
import { ShuttleService, ShuttleRoute } from "./ShuttleService";
import { RouteInfo, StepInfo, DepartureTimeConfig } from "../types/Directions";
import {
    ShuttleCampus,
    SHUTTLE_STOPS,
    getCampusForLocation,
    getCampusForBuilding,
    getNextDeparture,
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

        // Fetch schedule and route in parallel
        const now =
            departureConfig.option === "now" ? new Date() : departureConfig.date;

        const [schedule, shuttleRoute] = await Promise.all([
            ShuttleService.fetchSchedule(getDayOfWeek(now)),
            ShuttleService.fetchRoute(),
        ]);

        if (schedule.no_service) return null;

        // Find next departure from origin campus
        const nextDep = getNextDeparture(schedule.departures, originCampus, now);
        if (!nextDep) return null;

        // Get shuttle stops
        const originStop = SHUTTLE_STOPS[originCampus];
        const destStop = SHUTTLE_STOPS[destCampus];

        // Fetch walking directions in parallel
        const [walkToStop, walkFromStop] = await Promise.all([
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

        // Build shuttle leg
        const shuttleLeg = buildShuttleLeg(
            shuttleRoute,
            originCampus,
            nextDep.departureTime,
        );

        // Compose full route
        return composeRoute(walkToStop, shuttleLeg, walkFromStop);
    }
}

/**
 * Creates the shuttle ride step/leg from backend route data.
 */
function buildShuttleLeg(
    route: ShuttleRoute,
    originCampus: ShuttleCampus,
    departureTime: Date,
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

    const step: StepInfo = {
        distanceMeters: SHUTTLE_DISTANCE_METERS,
        durationSeconds: SHUTTLE_DURATION_SECONDS,
        instruction: `Take the Concordia Shuttle from ${originLabel} to ${destLabel}`,
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
        durationSeconds: SHUTTLE_DURATION_SECONDS,
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
