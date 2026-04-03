import { useCallback, useEffect, useMemo, useReducer } from "react";
import { initialMapUIState, mapUIReducer } from "../reducers/mapUIReducer";
import { IndoorDataService } from "../services/IndoorDataService";
import { PoiService } from "../services/PoiService";
import { UserPreferencesService } from "../services/UserPreferencesService";
import { LocationType, isClassroom, isPoi } from "../state/SearchPanelState";
import { Building } from "../types/Building";
import { DepartureTimeConfig, TravelMode } from "../types/Directions";
import { IndoorRoom } from "../types/IndoorRoom";
import { PointOfInterest } from "../types/PointOfInterest";
import { findCurrentBuilding } from "../utils/buildingDetection";
import { haversineDistance } from "../utils/distanceUtils";
import {
  getCampusForBuilding,
  getCampusForLocation,
  isShuttleEligible,
} from "../utils/shuttleUtils";
import { useDirections } from "./useDirections";
import { useRoutePreviews } from "./useRoutePreviews";

interface UserCoords {
  latitude: number;
  longitude: number;
}

interface LocationObject {
  coords: { latitude: number; longitude: number };
}

export function useMapUI(
  buildings: Building[],
  location: LocationObject | null,
) {
  const [state, dispatch] = useReducer(mapUIReducer, initialMapUIState);

  // ── Direction-fetch callbacks (stable refs into reducer) ──
  const onRouteLoading = useCallback(
    () => dispatch({ type: "ROUTE_LOADING" }),
    [],
  );
  const onRouteLoaded = useCallback(
    (route: any) => dispatch({ type: "ROUTE_LOADED", route }),
    [],
  );
  const onRouteError = useCallback(
    (err: string) => dispatch({ type: "ROUTE_ERROR", error: err }),
    [],
  );

  const userCoords = useMemo(
    (): UserCoords | null =>
      location
        ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        : null,
    // Stable by coords to avoid DirectionPanel effect loop when location object reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location?.coords.latitude, location?.coords.longitude],
  );

  useDirections({
    destination: state.selectedBuilding,
    startBuilding: state.startBuilding,
    destinationRoom: state.destinationRoom,
    startRoom: state.startRoom,
    userLocation: userCoords,
    travelMode: state.travelMode,
    departureConfig: state.departureConfig,
    active: state.panel === "directions" || state.panel === "room-info",
    accessibilityMode: state.accessibilityMode,
    onLoading: onRouteLoading,
    onLoaded: onRouteLoaded,
    onError: onRouteError,
  });

  // ── Pre-fetch route previews for all modes ──
  const routePreviews = useRoutePreviews({
    destination: state.selectedBuilding,
    startBuilding: state.startBuilding,
    startRoom: state.startRoom,
    userLocation: userCoords,
    departureConfig: state.departureConfig,
    active: state.panel === "directions" || state.panel === "room-info",
  });

  // ── Load persisted accessibility preference ──
  useEffect(() => {
    UserPreferencesService.load().then((prefs) => {
      if (prefs.accessibilityMode) {
        dispatch({ type: "SET_ACCESSIBILITY_MODE", enabled: true });
      }
    });
  }, []);

  // ── Detect current building ──
  useEffect(() => {
    if (location && buildings.length > 0) {
      const building = findCurrentBuilding(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        buildings,
      );
      dispatch({ type: "SET_CURRENT_BUILDING", building });
    } else {
      dispatch({ type: "SET_CURRENT_BUILDING", building: null });
    }
  }, [location, buildings]);

  // ── Shuttle eligibility check (pure cross-campus detection, no backend needed) ──
  useEffect(() => {
    if (state.panel !== "directions" || !state.selectedBuilding) {
      dispatch({ type: "SET_SHUTTLE_ELIGIBLE", eligible: false });
      return;
    }

    const destCampus = getCampusForBuilding(state.selectedBuilding);

    let originCampus;
    if (state.startBuilding) {
      originCampus = getCampusForBuilding(state.startBuilding);
    } else if (userCoords) {
      originCampus = getCampusForLocation(
        userCoords.latitude,
        userCoords.longitude,
      );
    } else {
      originCampus = null;
    }

    const eligible = isShuttleEligible(originCampus, destCampus);
    dispatch({ type: "SET_SHUTTLE_ELIGIBLE", eligible });
  }, [state.panel, state.selectedBuilding, state.startBuilding, userCoords]);

  // ── Handlers ──
  const selectBuilding = useCallback((building: Building) => {
    dispatch({ type: "SELECT_BUILDING", building });
  }, []);

  const openDirections = useCallback(
    (building: Building, room?: IndoorRoom) => {
      dispatch({ type: "OPEN_DIRECTIONS", building, room });
    },
    [],
  );

  const handleSearch = useCallback(
    (
      query: string,
      locationType: LocationType,
      radiusKm?: number | null,
      classroomBuildingId?: string | null,
    ) => {
      if (isClassroom(locationType)) {
        IndoorDataService.ensureLoaded()
          .then(() => {
            let rooms;
            const trimmedQuery = query.trim();

            if (classroomBuildingId) {
              rooms = trimmedQuery
                ? IndoorDataService.searchRoomsByBuilding(
                    trimmedQuery,
                    classroomBuildingId,
                  )
                : IndoorDataService.getRoomsByBuilding(classroomBuildingId);
            } else {
              rooms = trimmedQuery
                ? IndoorDataService.searchRooms(trimmedQuery)
                : IndoorDataService.getRooms();
            }

            // If we are searching for a start location, wrap these results
            dispatch({ type: "ROOM_LOADED", results: rooms });
          })
          .catch(() => {
            dispatch({ type: "ROOM_LOADED", results: [] });
          });
        return null;
      }

      if (isPoi(locationType)) {
        // POI search — fetch from backend, filter client-side
        dispatch({ type: "POI_LOADING" });
        PoiService.fetchPois()
          .then((pois) => {
            let filtered = pois.filter((p) => p.category === locationType);

            if (radiusKm != null && userCoords) {
              filtered = filtered.filter(
                (p) =>
                  haversineDistance(
                    userCoords.latitude,
                    userCoords.longitude,
                    p.latitude,
                    p.longitude,
                  ) <= radiusKm,
              );
            }

            dispatch({ type: "POI_LOADED", results: filtered });
          })
          .catch((err) => {
            dispatch({
              type: "POI_ERROR",
              error: err instanceof Error ? err.message : "Failed to load POIs",
            });
          });
        return null;
      }

      // Building search (existing logic)
      if (!query) return null;

      const q = query.toLowerCase();
      const match = buildings.find(
        (b) =>
          b.buildingName.toLowerCase().includes(q) ||
          b.buildingLongName.toLowerCase().includes(q) ||
          b.buildingCode.toLowerCase() === q,
      );
      return match ?? null;
    },
    [buildings, userCoords],
  );

  const openIndoorView = useCallback((buildingId: string, floor: number) => {
    dispatch({ type: "OPEN_INDOOR", buildingId, floor });
  }, []);

  const selectPoi = useCallback((poi: PointOfInterest) => {
    dispatch({ type: "SELECT_POI", poi });
  }, []);

  const clearPoi = useCallback(() => {
    dispatch({ type: "CLEAR_POI" });
  }, []);

  const handleTravelModeChange = useCallback((mode: TravelMode | null) => {
    if (mode === null) {
      dispatch({ type: "RESET_TRAVEL_MODE", mode: null });
    } else {
      dispatch({ type: "SET_TRAVEL_MODE", mode });
    }
  }, []);

  const handleDepartureConfigChange = useCallback(
    (config: DepartureTimeConfig) => {
      dispatch({ type: "SET_DEPARTURE_CONFIG", config });
    },
    [],
  );

  const setAccessibilityMode = useCallback((enabled: boolean) => {
    dispatch({ type: "SET_ACCESSIBILITY_MODE", enabled });
    UserPreferencesService.save({ accessibilityMode: enabled });
  }, []);

  return {
    state,
    dispatch,
    userCoords,
    routePreviews,
    selectBuilding,
    openDirections,
    openIndoorView,
    handleSearch,
    handleTravelModeChange,
    selectPoi,
    clearPoi,
    handleDepartureConfigChange,
    setAccessibilityMode,
  };
}
