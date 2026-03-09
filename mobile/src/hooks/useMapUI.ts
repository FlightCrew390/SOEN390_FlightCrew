import { useCallback, useEffect, useMemo, useReducer } from "react";
import { initialMapUIState, mapUIReducer } from "../reducers/mapUIReducer";
import { PoiService } from "../services/PoiService";
import { LocationType, isPoi } from "../state/SearchPanelState";
import { Building } from "../types/Building";
import { DepartureTimeConfig, TravelMode } from "../types/Directions";
import { PointOfInterest } from "../types/PointOfInterest";
import { findCurrentBuilding } from "../utils/buildingDetection";
import { getClosestCampusId } from "../utils/campusDetection";
import { haversineDistance } from "../utils/distanceUtils";
import { useDirections } from "./useDirections";

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

  const userCampus = useMemo(
    () =>
      location
        ? getClosestCampusId(
            location.coords.latitude,
            location.coords.longitude,
          )
        : null,
    [location],
  );

  useDirections({
    destination: state.selectedBuilding,
    startBuilding: state.startBuilding,
    userLocation: userCoords,
    userCampus,
    travelMode: state.travelMode,
    departureConfig: state.departureConfig,
    active: state.panel === "directions",
    onLoading: onRouteLoading,
    onLoaded: onRouteLoaded,
    onError: onRouteError,
  });

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

  // ── Handlers ──
  const selectBuilding = useCallback((building: Building) => {
    dispatch({ type: "SELECT_BUILDING", building });
  }, []);

  const openDirections = useCallback((building: Building) => {
    dispatch({ type: "OPEN_DIRECTIONS", building });
  }, []);

  const handleSearch = useCallback(
    (query: string, locationType: LocationType, radiusKm?: number | null) => {
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

  return {
    state,
    dispatch,
    userCoords,
    userCampus,
    selectBuilding,
    openDirections,
    handleSearch,
    handleTravelModeChange,
    selectPoi,
    clearPoi,
    handleDepartureConfigChange,
  };
}
