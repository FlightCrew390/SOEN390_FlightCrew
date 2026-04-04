import { useEffect } from "react";
import { DirectionsService } from "../services/DirectionsService";
import { IndoorDataService } from "../services/IndoorDataService";
import { IndoorPathfindingService } from "../services/IndoorPathfindingService";
import { ShuttleDirectionsBuilder } from "../services/ShuttleDirectionsBuilder";
import { Building } from "../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  StepInfo,
  TRAVEL_MODE,
  TravelMode,
} from "../types/Directions";
import { IndoorNode, IndoorRoom, IndoorStep } from "../types/IndoorRoom";
import { getDirectionOriginCoords } from "../utils/directionsUtils";

const mapStep = (s: IndoorStep): StepInfo => ({
  id: `${s.startNodeId}-${s.endNodeId}`,
  distanceMeters: s.distanceMeters,
  durationSeconds: s.durationSeconds,
  instruction: s.instruction,
  maneuver: s.maneuver,
  coordinates: [],
  startFloor: s.startFloor,
  endFloor: s.endFloor,
});

const getEdgeNodes = (bId: string): IndoorNode[] => {
  const nodes = IndoorDataService.getAllNodes();
  let edgeNodes = nodes.filter(
    (n) =>
      n.buildingId === bId && n.type.includes("entry_exit") && n.floor === 1,
  );
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter(
      (n) => n.buildingId === bId && n.type.includes("entry_exit"),
    );
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter(
      (n) => n.buildingId === bId && n.type === "doorway" && n.floor === 1,
    );
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter((n) => n.buildingId === bId && n.floor === 1);
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter((n) => n.buildingId === bId);
  return edgeNodes;
};

interface IndoorEdgePathResult {
  path: IndoorRoom[];
  steps: StepInfo[] | undefined;
}

interface IndoorEdgePathCandidate {
  path: IndoorRoom[];
  distanceMeters: number;
  steps?: IndoorStep[];
}

const isFulfilled = <T>(
  result: PromiseSettledResult<T>,
): result is PromiseFulfilledResult<T> => result.status === "fulfilled";

const getArtificialIndoorEdgePath = (
  room: IndoorRoom,
  fallbackNode: IndoorRoom,
  direction: "departure" | "arrival",
): IndoorRoom[] => {
  const syntheticId = direction === "departure" ? "synth_0" : "synth_1";
  const needsMid = fallbackNode.floor !== room.floor;
  const midNode: IndoorRoom = {
    ...fallbackNode,
    id: syntheticId,
    floor: room.floor,
  };

  return direction === "departure"
    ? [room, ...(needsMid ? [midNode] : []), fallbackNode]
    : [fallbackNode, ...(needsMid ? [midNode] : []), room];
};

const selectBestIndoorEdgePath = (
  results: PromiseSettledResult<{
    en: IndoorNode;
    res: IndoorEdgePathCandidate;
  }>[],
): IndoorEdgePathCandidate | null => {
  let bestPath: IndoorEdgePathCandidate | null = null;

  for (const result of results) {
    if (!isFulfilled(result)) continue;

    const { res } = result.value;
    if (!bestPath || res.distanceMeters < bestPath.distanceMeters) {
      bestPath = res;
    }
  }

  return bestPath;
};

async function fetchIndoorEdgePath(
  room: IndoorRoom,
  direction: "departure" | "arrival",
  accessible = false,
): Promise<IndoorEdgePathResult> {
  await IndoorDataService.ensureLoaded();

  const bId = room.buildingId;
  const edgeNodes = getEdgeNodes(bId);

  const results = await Promise.allSettled(
    edgeNodes.map(async (en) => {
      if (en.id === room.id)
        return {
          en,
          res: {
            path: [en as IndoorRoom],
            distanceMeters: 0,
            steps: [] as IndoorStep[],
          },
        };
      const [startId, endId] =
        direction === "departure" ? [room.id, en.id] : [en.id, room.id];
      const res = await IndoorPathfindingService.getDirections(
        bId,
        startId,
        endId,
        accessible,
      );
      return { en, res };
    }),
  );

  const bestPath = selectBestIndoorEdgePath(results);

  if (bestPath) {
    return { path: bestPath.path, steps: (bestPath.steps ?? []).map(mapStep) };
  }

  if (edgeNodes.length > 0) {
    const fallbackNode = edgeNodes[0] as IndoorRoom;
    console.warn(
      "Backend graph missing path. Using artificial straight line fallback.",
    );
    return {
      path: getArtificialIndoorEdgePath(room, fallbackNode, direction),
      steps: undefined,
    };
  }

  return { path: [room], steps: undefined };
}

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
  /** Whether accessibility mode is enabled. */
  accessibilityMode: boolean;
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
  accessibilityMode,
  onLoading,
  onLoaded,
  onError,
}: UseDirectionsParams) {
  const getRoute = async (options: {
    originLat: number;
    originLng: number;
    destination: Building;
    startRoom: IndoorRoom | null;
    destinationRoom: IndoorRoom | null;
    startBuilding: Building | null;
    travelMode: TravelMode;
    departureTime: string | undefined;
    arrivalTime: string | undefined;
    departureConfig: DepartureTimeConfig;
  }): Promise<RouteInfo | null> => {
    const {
      originLat,
      originLng,
      destination,
      startRoom,
      destinationRoom,
      startBuilding,
      travelMode,
      departureTime,
      arrivalTime,
      departureConfig,
    } = options;

    // Handle indoor pathfinding if both start and dest are rooms in the same building
    if (
      startRoom?.buildingId &&
      startRoom.buildingId === destinationRoom?.buildingId
    ) {
      try {
        const indoorRes = await IndoorPathfindingService.getDirections(
          startRoom.buildingId,
          startRoom.id,
          destinationRoom.id,
          accessibilityMode,
        );

        return {
          distanceMeters: indoorRes.distanceMeters,
          durationSeconds:
            indoorRes.durationSeconds ?? indoorRes.distanceMeters * 2,
          coordinates: [],
          steps: (indoorRes.steps ?? []).map((s, idx) => ({
            id: `indoor-step-${idx}`,
            distanceMeters: s.distanceMeters,
            durationSeconds: s.durationSeconds,
            instruction: s.instruction,
            maneuver: s.maneuver,
            coordinates: [],
            startFloor: s.startFloor,
            endFloor: s.endFloor,
          })),
          indoorPath: indoorRes.path,
        } as RouteInfo;
      } catch (e) {
        console.error("Indoor pathfinding failed", e);
        throw new Error("Could not compute indoor path.");
      }
    } else if (travelMode === TRAVEL_MODE.SHUTTLE) {
      return await ShuttleDirectionsBuilder.buildShuttleRoute(
        originLat,
        originLng,
        destination.latitude,
        destination.longitude,
        departureConfig,
        startBuilding,
        destination,
      );
    } else {
      return await DirectionsService.fetchDirections(
        originLat,
        originLng,
        destination.latitude,
        destination.longitude,
        travelMode,
        departureTime,
        arrivalTime,
      );
    }
  };

  const appendIndoorSegmentsIfNeeded = async (
    route: RouteInfo | null,
  ): Promise<RouteInfo | null> => {
    if (!route) return route;

    const isPureIndoorSameBuildingRoute =
      !!startRoom?.buildingId &&
      startRoom.buildingId === destinationRoom?.buildingId;

    if (isPureIndoorSameBuildingRoute) return route;

    let augmented = { ...route };

    // If outdoor route was fetched but we have a start room, fetch the indoor departure path
    if (!augmented.indoorPathOrigin && startRoom) {
      try {
        const { path, steps } = await fetchIndoorEdgePath(
          startRoom,
          "departure",
          accessibilityMode,
        );
        augmented = {
          ...augmented,
          indoorPathOrigin: path,
          indoorStepsOrigin: steps,
        };
      } catch (e) {
        console.warn(
          "Could not compute indoor->outdoor departure path segment:",
          e,
        );
      }
    }

    // If outdoor route was fetched but we have a destination room, fetch the indoor arrival path
    if (!augmented.indoorPath && destinationRoom) {
      try {
        const { path, steps } = await fetchIndoorEdgePath(
          destinationRoom,
          "arrival",
          accessibilityMode,
        );
        augmented = { ...augmented, indoorPath: path, indoorSteps: steps };
      } catch (e) {
        console.warn(
          "Could not compute outdoor->indoor arrival path segment:",
          e,
        );
      }
    }

    return augmented;
  };

  useEffect(() => {
    if (!active || !destination || travelMode == null) return;

    // Determine the origin coordinates
    const originCoords = getDirectionOriginCoords(
      startBuilding,
      startRoom,
      userLocation,
    );
    const originLat = originCoords?.latitude;
    const originLng = originCoords?.longitude;

    if (originLat == null || originLng == null) return;

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
        const route = await getRoute({
          originLat,
          originLng,
          destination,
          startRoom,
          destinationRoom,
          startBuilding,
          travelMode,
          departureTime,
          arrivalTime,
          departureConfig,
        });
        const augmentedRoute = await appendIndoorSegmentsIfNeeded(route);

        if (!cancelled) onLoaded(augmentedRoute);
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
    accessibilityMode,
  ]);
}
