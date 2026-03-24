import { useEffect, useRef } from "react";
import { DirectionsService } from "../services/DirectionsService";
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
import { IndoorRoom } from "../types/IndoorRoom";
import { getDirectionOriginCoords } from "../utils/directionsUtils";

const getEdgeNodes = (bId: string, IndoorDataService: any) => {
  const nodes = IndoorDataService.getAllNodes();
  let edgeNodes = nodes.filter(
    (n: any) =>
      n.buildingId === bId && n.type?.includes("entry_exit") && n.floor === 1,
  );
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter(
      (n: any) => n.buildingId === bId && n.type?.includes("entry_exit"),
    );
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter(
      (n: any) => n.buildingId === bId && n.type === "doorway" && n.floor === 1,
    );
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter((n: any) => n.buildingId === bId && n.floor === 1);
  if (edgeNodes.length === 0)
    edgeNodes = nodes.filter((n: any) => n.buildingId === bId);

  return edgeNodes;
};

async function fetchIndoorDeparturePath(startRoom: IndoorRoom) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { IndoorDataService } = require("../services/IndoorDataService");
  await IndoorDataService.ensureLoaded();

  const bId = startRoom.buildingId;
  const exitNodes = getEdgeNodes(bId, IndoorDataService);

  let bestPath = null;
  let bestExitNode = null;
  let bestSteps: any[] = [];
  let minDistance = Infinity;

  const promises = exitNodes.map(async (en: any) => {
    if (en.id === startRoom.id)
      return { en, res: { path: [en], distanceMeters: 0 } as any };
    const res = await IndoorPathfindingService.getDirections(
      bId,
      startRoom.id,
      en.id,
    );
    return { en, res };
  });

  const results = await Promise.allSettled(promises);
  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.res.distanceMeters < minDistance) {
        minDistance = result.value.res.distanceMeters;
        bestPath = result.value.res.path;
        bestSteps = result.value.res.steps ?? [];
        bestExitNode = result.value.en;
      }
    }
  }

  if (bestPath && bestExitNode) {
    return {
      pathOrigin: bestPath as IndoorRoom[],
      stepsOrigin: bestSteps.map((s: any) => ({
        distanceMeters: s.distanceMeters,
        durationSeconds: s.durationSeconds,
        instruction: s.instruction,
        maneuver: s.maneuver,
        coordinates: [],
        startFloor: s.startFloor,
        endFloor: s.endFloor,
      })) as StepInfo[],
    };
  } else if (exitNodes.length > 0) {
    const fallbackNode = exitNodes[0];
    console.warn(
      "Backend graph missing path. Using artificial straight line fallback for departure.",
    );
    const artificialPath = [startRoom];
    if (fallbackNode.floor !== startRoom.floor) {
      artificialPath.push({
        ...(fallbackNode as IndoorRoom),
        id: "synth_0",
        floor: startRoom.floor,
      });
    }
    artificialPath.push(fallbackNode as IndoorRoom);
    return { pathOrigin: artificialPath, stepsOrigin: undefined };
  } else {
    return { pathOrigin: [startRoom], stepsOrigin: undefined };
  }
}

async function fetchIndoorArrivalPath(destinationRoom: IndoorRoom) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { IndoorDataService } = require("../services/IndoorDataService");
  await IndoorDataService.ensureLoaded();

  const bId = destinationRoom.buildingId;
  const entryNodes = getEdgeNodes(bId, IndoorDataService);

  let bestPath = null;
  let bestEntryNode = null;
  let bestSteps: any[] = [];
  let minDistance = Infinity;

  const promises = entryNodes.map(async (en: any) => {
    if (en.id === destinationRoom.id)
      return { en, res: { path: [en], distanceMeters: 0 } as any };
    const res = await IndoorPathfindingService.getDirections(
      bId,
      en.id,
      destinationRoom.id,
    );
    return { en, res };
  });

  const results = await Promise.allSettled(promises);
  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.res.distanceMeters < minDistance) {
        minDistance = result.value.res.distanceMeters;
        bestPath = result.value.res.path;
        bestSteps = result.value.res.steps ?? [];
        bestEntryNode = result.value.en;
      }
    }
  }

  if (bestPath && bestEntryNode) {
    return {
      path: bestPath as IndoorRoom[],
      steps: bestSteps.map((s: any) => ({
        distanceMeters: s.distanceMeters,
        durationSeconds: s.durationSeconds,
        instruction: s.instruction,
        maneuver: s.maneuver,
        coordinates: [],
        startFloor: s.startFloor,
        endFloor: s.endFloor,
      })) as StepInfo[],
    };
  } else if (entryNodes.length > 0) {
    const fallbackNode = entryNodes[0];
    console.warn(
      "Backend graph missing path. Using artificial straight line fallback.",
    );
    const artificialPath = [fallbackNode as IndoorRoom];
    if (fallbackNode.floor !== destinationRoom.floor) {
      artificialPath.push({
        ...(fallbackNode as IndoorRoom),
        id: "synth_1",
        floor: destinationRoom.floor,
      });
    }
    artificialPath.push(destinationRoom);
    return { path: artificialPath, steps: undefined };
  } else {
    return { path: [destinationRoom], steps: undefined };
  }
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
  }) => {
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
        );

        return {
          distanceMeters: indoorRes.distanceMeters,
          durationSeconds:
            indoorRes.durationSeconds ?? indoorRes.distanceMeters * 2,
          coordinates: [],
          steps: (indoorRes.steps ?? []).map((s) => ({
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

  const appendIndoorSegmentsIfNeeded = async (route: RouteInfo | null) => {
    if (!route) {
      return route;
    }

    const isPureIndoorSameBuildingRoute =
      !!startRoom?.buildingId &&
      startRoom.buildingId === destinationRoom?.buildingId;

    if (isPureIndoorSameBuildingRoute) {
      return route;
    }

    // If outdoor route was fetched but we have a start room, fetch the indoor departure path
    if (!route.indoorPathOrigin && startRoom) {
      try {
        const indoorDeparture = await fetchIndoorDeparturePath(startRoom);
        route.indoorPathOrigin = indoorDeparture.pathOrigin;
        route.indoorStepsOrigin = indoorDeparture.stepsOrigin;
      } catch (e) {
        console.warn(
          "Could not compute indoor->outdoor departure path segment:",
          e,
        );
      }
    }

    // If outdoor route was fetched but we have a destination room, fetch the indoor arrival path
    if (!route.indoorPath && destinationRoom) {
      try {
        const indoorArrival = await fetchIndoorArrivalPath(destinationRoom);
        route.indoorPath = indoorArrival.path;
        route.indoorSteps = indoorArrival.steps;
      } catch (e) {
        console.warn(
          "Could not compute outdoor->indoor arrival path segment:",
          e,
        );
      }
    }

    return route;
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
