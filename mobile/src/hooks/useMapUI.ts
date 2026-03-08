import { useCallback, useEffect, useMemo, useReducer } from "react";
import { initialMapUIState, mapUIReducer } from "../reducers/mapUIReducer";
import { LocationType } from "../state/SearchPanelState";
import { Building } from "../types/Building";
import { DepartureTimeConfig, TravelMode } from "../types/Directions";
import { findCurrentBuilding } from "../utils/buildingDetection";
import { useDirections } from "./useDirections";
import { useRoutePreviews } from "./useRoutePreviews";
import {
  getCampusForBuilding,
  getCampusForLocation,
  isShuttleEligible,
} from "../utils/shuttleUtils";

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

  // ── Derived user coordinates ──
  const userCoords: UserCoords | null = useMemo(
    () =>
      location
        ? {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        }
        : null,
    [location?.coords.latitude, location?.coords.longitude],
  );

  // ── Wire direction fetching ──
  useDirections({
    destination: state.selectedBuilding,
    startBuilding: state.startBuilding,
    userLocation: userCoords,
    travelMode: state.travelMode,
    departureConfig: state.departureConfig,
    active: state.panel === "directions",
    onLoading: onRouteLoading,
    onLoaded: onRouteLoaded,
    onError: onRouteError,
  });

  // ── Pre-fetch route previews for all modes ──
  const routePreviews = useRoutePreviews({
    destination: state.selectedBuilding,
    startBuilding: state.startBuilding,
    userLocation: userCoords,
    departureConfig: state.departureConfig,
    active: state.panel === "directions",
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

  const openDirections = useCallback((building: Building) => {
    dispatch({ type: "OPEN_DIRECTIONS", building });
  }, []);

  const handleSearch = useCallback(
    (query: string, locationType: LocationType) => {
      if (!query) return null;

      if (locationType === "building") {
        const q = query.toLowerCase();
        const match = buildings.find(
          (b) =>
            b.buildingName.toLowerCase().includes(q) ||
            b.buildingLongName.toLowerCase().includes(q) ||
            b.buildingCode.toLowerCase() === q,
        );
        return match ?? null;
      }
      return null;
    },
    [buildings],
  );

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
    routePreviews,
    selectBuilding,
    openDirections,
    handleSearch,
    handleTravelModeChange,
    handleDepartureConfigChange,
  };
}
