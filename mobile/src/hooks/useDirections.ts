import { useEffect, useRef } from "react";
import { SHUTTLE_STOPS } from "../constants/shuttle";
import { DirectionsService } from "../services/DirectionsService";
import { normalizeCampus } from "../services/GoogleDirectionsService";
import { ShuttleService } from "../services/ShuttleService";
import { Building } from "../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  TravelMode,
} from "../types/Directions";

/** Parse backend duration string (e.g. "21 mins", "1 hr 5 min") into seconds */
function parseShuttleDurationToSeconds(durationStr: string): number {
  let seconds = 0;
  const hrMatch = durationStr.match(/(\d+)\s*(?:hr|hrs?)\b/i);
  if (hrMatch) seconds += Number.parseInt(hrMatch[1], 10) * 3600;
  const minMatch = durationStr.match(/(\d+)\s*(?:min|mins?)\b/i);
  if (minMatch) seconds += Number.parseInt(minMatch[1], 10) * 60;
  return seconds || 60; // fallback 1 min if unparseable
}

/** Normalize "H:MM" or "HH:MM" to "HH:MM" for reliable string comparison */
function toHHMM(timeStr: string | null | undefined): string {
  if (timeStr == null || timeStr === "") return "";
  const parts = timeStr.trim().split(":");
  const h = parts[0]?.replace(/\D/g, "") ?? "0";
  const m = parts[1]?.replace(/\D/g, "") ?? "0";
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

const DAY_NAMES = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

interface UseDirectionsParams {
  /** The destination building (required for non-shuttle modes). */
  destination: Building | null;
  /** Optional custom start building; when null the user's live location is used. */
  startBuilding: Building | null;
  /** User's current GPS coordinates, used when startBuilding is null. */
  userLocation: { latitude: number; longitude: number } | null;
  /** User's campus (SGW or LOYOLA) for shuttle mode. */
  userCampus: string | null;
  /** Selected travel mode. */
  travelMode: TravelMode | null;
  /** Departure / arrival time configuration. */
  departureConfig: DepartureTimeConfig;
  /** Whether the directions panel is open. */
  active: boolean;
  /** Callbacks into the reducer. */
  onLoading: () => void;
  onLoaded: (route: RouteInfo | null) => void;
  onError: (error: string) => void;
}

/**
 * Fetches directions whenever the origin, destination, travel mode, or
 * departure config changes while the directions panel is active.
 */
export function useDirections({
  destination,
  startBuilding,
  userLocation,
  userCampus,
  travelMode,
  departureConfig,
  active,
  onLoading,
  onLoaded,
  onError,
}: UseDirectionsParams) {
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!active || travelMode == null) return;

    if (travelMode === "SHUTTLE") {
      if (!userCampus) return;
      const normalized = normalizeCampus(userCampus) as "SGW" | "LOY";
      const other = normalized === "SGW" ? "LOY" : "SGW";
      const originStop = SHUTTLE_STOPS[normalized];
      const destStop = SHUTTLE_STOPS[other];

      let cancelled = false;
      const fetchShuttle = async () => {
        onLoading();
        try {
          const routeData = await ShuttleService.getRoute();
          if (cancelled) return;

          const rideDurationSeconds = parseShuttleDurationToSeconds(
            routeData.duration,
          );
          const refDate =
            departureConfig.option === "depart_at"
              ? departureConfig.date
              : departureConfig.option === "arrive_by"
                ? new Date(
                    departureConfig.date.getTime() - rideDurationSeconds * 1000,
                  )
                : new Date();
          const day = DAY_NAMES[refDate.getDay()];
          const refHHMM = toHHMM(
            `${refDate.getHours()}:${refDate.getMinutes()}`,
          );

          const scheduleData = await ShuttleService.getSchedule(day);
          if (cancelled) return;

          const coords =
            normalized === "SGW"
              ? routeData.sgw_to_loyola
              : routeData.loyola_to_sgw;

          const coordinates = coords.map((c) => ({
            latitude: c.latitude,
            longitude: c.longitude,
          }));

          const departureKey =
            normalized === "SGW" ? "sgw_departure" : "loyola_departure";

          const isArriveBy = departureConfig.option === "arrive_by";
          const nextDepartures = scheduleData.no_service
            ? []
            : scheduleData.departures
                .filter((d) => {
                  const dep = d[departureKey];
                  const depHHMM = toHHMM(dep);
                  if (depHHMM === "") return false;
                  return isArriveBy ? depHHMM <= refHHMM : depHHMM >= refHHMM;
                })
                .slice(isArriveBy ? -3 : 0, isArriveBy ? undefined : 3)
                .map((d) => d[departureKey] as string);
          if (isArriveBy) nextDepartures.reverse();

          const hasUpcomingDepartures = nextDepartures.length > 0;
          if (!hasUpcomingDepartures) {
            onLoaded(null);
            onError("No shuttle available");
            return;
          }

          const departureInfo = `Next departures: ${nextDepartures.join(", ")}`;

          const route: RouteInfo = {
            coordinates,
            distanceMeters: 0,
            durationSeconds: rideDurationSeconds,
            durationText: routeData.duration,
            distanceText: routeData.distance,
            steps: [
              {
                instruction: `Board at ${originStop.name} (${originStop.address})`,
                maneuver: "depart",
                distanceMeters: 0,
                durationSeconds: 0,
                coordinates: [coordinates[0]],
              },
              {
                instruction: `Ride Concordia Shuttle to ${destStop.name} (~${routeData.duration})`,
                maneuver: "straight",
                distanceMeters: 0,
                durationSeconds: rideDurationSeconds,
                coordinates,
              },
              {
                instruction: `Get off at ${destStop.name} (${destStop.address})`,
                maneuver: "arrive",
                distanceMeters: 0,
                durationSeconds: 0,
                coordinates: [coordinates[coordinates.length - 1]],
              },
              {
                instruction: departureInfo,
                maneuver: "straight",
                distanceMeters: 0,
                durationSeconds: 0,
                coordinates: [coordinates[0]],
              },
            ],
          };

          onLoaded(route);
        } catch (err) {
          if (!cancelled) {
            onError(
              err instanceof Error
                ? err.message
                : "Failed to load shuttle route",
            );
          }
        }
      };
      fetchShuttle();
      return () => {
        cancelled = true;
      };
    }

    if (!destination) return;
    const originLat = startBuilding?.latitude ?? userLocation?.latitude;
    const originLng = startBuilding?.longitude ?? userLocation?.longitude;
    if (originLat == null || originLng == null) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    let cancelled = false;

    // Derive departure/arrival time strings from config.
    // Drive ignores time: backend returns route as "leaving now" so we get steps + polyline and "View route".
    const useTime =
      travelMode !== "DRIVE" &&
      (departureConfig.option === "depart_at" ||
        departureConfig.option === "arrive_by");
    const departureTime =
      useTime && departureConfig.option === "depart_at"
        ? departureConfig.date.toISOString()
        : undefined;
    const arrivalTime =
      useTime && departureConfig.option === "arrive_by"
        ? departureConfig.date.toISOString()
        : undefined;

    const fetchRoute = async () => {
      onLoading();
      try {
        const route = await DirectionsService.fetchDirections(
          originLat,
          originLng,
          destination.latitude,
          destination.longitude,
          travelMode,
          departureTime,
          arrivalTime,
        );
        if (!cancelled) onLoaded(route);
      } catch (err) {
        if (!cancelled) {
          onError(
            err instanceof Error ? err.message : "Failed to load directions",
          );
        }
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callbacks are stable dispatch wrappers
  }, [
    active,
    destination?.buildingCode,
    startBuilding?.buildingCode,
    userLocation?.latitude,
    userLocation?.longitude,
    userCampus,
    travelMode,
    departureConfig.option,
    departureConfig.date,
  ]);
}
