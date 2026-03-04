import { useEffect, useRef } from "react";
import { SHUTTLE_STOPS } from "../constants/shuttle";
import { DirectionsService } from "../services/DirectionsService";
import { normalizeCampus } from "../services/GoogleDirectionsService";
import { Building } from "../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  TravelMode,
} from "../types/Directions";

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
      const origin = SHUTTLE_STOPS[normalized].coordinate;
      const dest = SHUTTLE_STOPS[other].coordinate;

      let cancelled = false;
      const fetchShuttle = async () => {
        onLoading();
        try {
          const route = await DirectionsService.fetchDirections(
            origin.latitude,
            origin.longitude,
            dest.latitude,
            dest.longitude,
            "DRIVE",
          );
          if (!cancelled) onLoaded(route);
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

    // Derive departure/arrival time strings from config
    const departureTime =
      departureConfig.option === "depart_at"
        ? departureConfig.date.toISOString()
        : undefined;
    const arrivalTime =
      departureConfig.option === "arrive_by"
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
