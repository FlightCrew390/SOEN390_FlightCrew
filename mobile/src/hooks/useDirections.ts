import { useEffect, useRef } from "react";
import { DirectionsService } from "../services/DirectionsService";
import { ShuttleDirectionsBuilder } from "../services/ShuttleDirectionsBuilder";
import { IndoorPathfindingService } from "../services/IndoorPathfindingService";
import { Building } from "../types/Building";
import { IndoorRoom } from "../types/IndoorRoom";
import {
  DepartureTimeConfig,
  RouteInfo,
  TRAVEL_MODE,
  TravelMode,
} from "../types/Directions";

interface UseDirectionsParams {
  /** The destination building (required). */
  destination: Building | null;
  /** Optional custom start building; when null the user's live location is used. */
  startBuilding: Building | null;
  /** The destination room. */
  destinationRoom: IndoorRoom | null;
  /** The starting room. */
  startRoom: IndoorRoom | null;
  /** User's current GPS coordinates, used when startBuilding is null. */
  userLocation: { latitude: number; longitude: number } | null;
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
  destinationRoom,
  startRoom,
  userLocation,
  travelMode,
  departureConfig,
  active,
  onLoading,
  onLoaded,
  onError,
}: UseDirectionsParams) {
  // Use a ref for the abort controller so we can cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!active || !destination || travelMode == null) return;

    // Determine the origin coordinates
    const originLat = startBuilding?.latitude ?? userLocation?.latitude;
    const originLng = startBuilding?.longitude ?? userLocation?.longitude;

    if (originLat == null || originLng == null) return;

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    // Derive departure/arrival time strings from config.
    // DRIVE mode does not support future departure/arrival times in the
    // Google Routes API, so we omit them to avoid errors.
    const departureTime =
      departureConfig.option === "depart_at" && travelMode !== TRAVEL_MODE.DRIVE
        ? departureConfig.date.toISOString()
        : undefined;
    const arrivalTime =
      departureConfig.option === "arrive_by" && travelMode !== TRAVEL_MODE.DRIVE
        ? departureConfig.date.toISOString()
        : undefined;

    const fetchRoute = async () => {
      onLoading();
      try {
        let route;

        // Handle indoor pathfinding if both start and dest are rooms in the same building
        if (
          startRoom &&
          destinationRoom &&
          startRoom.buildingId === destinationRoom.buildingId
        ) {
          try {
            // Note: IndoorPathfindingService now expects (buildingId, startNodeId, endNodeId)
            const indoorRes = await IndoorPathfindingService.getDirections(
              startRoom.buildingId,
              startRoom.id,
              destinationRoom.id,
            );

            route = {
              distanceMeters: indoorRes.distanceMeters,
              durationSeconds: indoorRes.distanceMeters * 2, // approximation
              encodedPolyline: "", // we'll draw our own indoor lines based on nodes
              mode: travelMode,
              coordinates: [],
              steps: [],
              indoorPath: indoorRes.path,
            } as any;
          } catch (e) {
            console.error("Indoor pathfinding failed", e);
            throw new Error("Could not compute indoor path.");
          }
        } else if (travelMode === TRAVEL_MODE.SHUTTLE) {
          route = await ShuttleDirectionsBuilder.buildShuttleRoute(
            originLat,
            originLng,
            destination.latitude,
            destination.longitude,
            departureConfig,
            startBuilding,
            destination,
          );
        } else {
          route = await DirectionsService.fetchDirections(
            originLat,
            originLng,
            destination.latitude,
            destination.longitude,
            travelMode,
            departureTime,
            arrivalTime,
          );
        }
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
    destinationRoom?.id,
    startRoom?.id,
    userLocation?.latitude,
    userLocation?.longitude,
    travelMode,
    departureConfig.option,
    departureConfig.date,
  ]);
}
