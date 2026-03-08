import { MapUIAction, MapUIState } from "../state/MapUIState";
import { DEFAULT_DEPARTURE_CONFIG } from "../types/Directions";

export const initialMapUIState: MapUIState = {
  panel: "none",
  selectedBuilding: null,
  currentBuilding: null,
  searchOrigin: "default",
  startBuilding: null,
  travelMode: null,
  departureConfig: DEFAULT_DEPARTURE_CONFIG,
  route: null,
  routeLoading: false,
  routeError: null,
  shuttleEligible: false,
  poiResults: [],
  selectedPoi: null,
  poiLoading: false,
  poiError: null,
};

export function mapUIReducer(
  state: MapUIState,
  action: MapUIAction,
): MapUIState {
  switch (action.type) {
    case "OPEN_SEARCH":
      return { ...state, panel: "search", searchOrigin: "default" };

    case "CLOSE_PANEL":
      return {
        ...state,
        panel: "none",
        searchOrigin: "default",
        travelMode: null,
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        route: null,
        routeLoading: false,
        routeError: null,
        shuttleEligible: false,
        poiResults: [],
        selectedPoi: null,
        poiLoading: false,
        poiError: null,
      };

    case "SELECT_BUILDING":
      return {
        ...state,
        selectedBuilding: action.building,
        panel: "none",
        searchOrigin: "default",
        route: null,
        routeLoading: false,
        routeError: null,
      };

    case "DESELECT_BUILDING":
      return { ...state, selectedBuilding: null };

    case "OPEN_DIRECTIONS":
      return {
        ...state,
        panel: "directions",
        selectedBuilding: action.building,
        startBuilding: null,
        travelMode: null,
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        route: null,
        routeLoading: false,
        routeError: null,
        shuttleEligible: false,
      };

    case "SET_CURRENT_BUILDING":
      return { ...state, currentBuilding: action.building };

    case "TAP_MAP":
      if (state.panel === "directions" || state.panel === "steps") return state;
      return { ...state, selectedBuilding: null, selectedPoi: null };

    case "OPEN_SEARCH_FOR_START":
      return { ...state, panel: "search", searchOrigin: "directions" };

    case "SET_START_BUILDING":
      return {
        ...state,
        panel: "directions",
        searchOrigin: "default",
        startBuilding: action.building,
        // Clear old route — a new fetch will be triggered by the component
        route: null,
        routeLoading: false,
        routeError: null,
      };

    case "RESET_START_BUILDING":
      return {
        ...state,
        startBuilding: null,
        route: null,
        routeLoading: false,
        routeError: null,
      };

    case "RETURN_TO_DIRECTIONS":
      return { ...state, panel: "directions", searchOrigin: "default" };

    case "SET_TRAVEL_MODE":
      return {
        ...state,
        travelMode: action.mode,
        // Clear old route so the component re-fetches with new mode
        route: null,
        routeLoading: false,
        routeError: null,
      };
    case "RESET_TRAVEL_MODE":
      return {
        ...state,
        travelMode: null,
        // Clear old route so the component re-fetches with new mode
        route: null,
        routeLoading: false,
        routeError: null,
      };

    case "ROUTE_LOADING":
      return { ...state, routeLoading: true, routeError: null };

    case "ROUTE_LOADED":
      return { ...state, route: action.route, routeLoading: false };

    case "ROUTE_ERROR":
      return {
        ...state,
        routeLoading: false,
        routeError: action.error,
        route: null,
      };

    case "OPEN_STEPS":
      return { ...state, panel: "steps" };

    case "CLOSE_STEPS":
      return { ...state, panel: "directions" };

    case "SET_SHUTTLE_ELIGIBLE":
      return { ...state, shuttleEligible: action.eligible };

    case "SET_DEPARTURE_CONFIG":
      return {
        ...state,
        departureConfig: action.config,
        route: null,
        routeLoading: false,
        routeError: null,
      };

    // ── POI actions ──
    case "POI_LOADING":
      return { ...state, poiLoading: true, poiError: null };

    case "POI_LOADED":
      return {
        ...state,
        poiResults: action.results,
        poiLoading: false,
        panel: "poi-results",
      };

    case "POI_ERROR":
      return {
        ...state,
        poiLoading: false,
        poiError: action.error,
        poiResults: [],
      };

    case "SELECT_POI":
      return {
        ...state,
        selectedPoi: action.poi,
        panel: "none",
      };

    case "CLEAR_POI":
      return {
        ...state,
        selectedPoi: null,
        poiResults: [],
      };

    case "BACK_TO_SEARCH":
      return {
        ...state,
        panel: "search",
        poiResults: [],
        poiError: null,
      };

    default:
      return state;
  }
}
