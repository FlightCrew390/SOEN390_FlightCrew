import { MapUIAction, MapUIState } from "../state/MapUIState";
import { DEFAULT_DEPARTURE_CONFIG } from "../types/Directions";

export const initialMapUIState: MapUIState = {
  panel: "none",
  // ... rest of state
  selectedBuilding: null,
  currentBuilding: null,
  searchOrigin: "default",
  startBuilding: null,
  startRoom: null,
  destinationRoom: null,
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
  roomResults: [],
  indoorBuildingId: null,
  indoorFloor: null,
  indoorSelectedRoom: null,
  activeStepIndex: -1,
  activeIndoorStepIndex: -1,
  accessibilityMode: false,
};

function handleClosePanel(state: MapUIState): MapUIState {
  return {
    ...state,
    panel: "none",
    searchOrigin: "default",
    destinationRoom: null,
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
    activeStepIndex: -1,
    activeIndoorStepIndex: -1,
  };
}

function handleOpenDirections(state: MapUIState, action: any): MapUIState {
  return {
    ...state,
    panel: "directions",
    selectedBuilding: action.building,
    destinationRoom: action.room ?? null,
    startBuilding: null,
    startRoom: null,
    travelMode: null,
    departureConfig: DEFAULT_DEPARTURE_CONFIG,
    route: null,
    routeLoading: false,
    routeError: null,
    shuttleEligible: false,
    indoorBuildingId: null,
    indoorFloor: null,
    indoorSelectedRoom: null,
    activeStepIndex: -1,
    activeIndoorStepIndex: -1,
  };
}

function handleSetStartBuilding(state: MapUIState, action: any): MapUIState {
  return {
    ...state,
    panel: "directions",
    searchOrigin: "default",
    startBuilding: action.building,
    startRoom: action.room ?? null,
    route: null,
    routeLoading: false,
    routeError: null,
    activeStepIndex: -1,
    activeIndoorStepIndex: -1,
  };
}

function handleTravelMode(state: MapUIState, mode: any): MapUIState {
  return {
    ...state,
    travelMode: mode,
    route: null,
    routeLoading: false,
    routeError: null,
  };
}

function handlePois(state: MapUIState, action: any): MapUIState {
  switch (action.type) {
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
      return { ...state, selectedPoi: action.poi, panel: "none" };
    case "CLEAR_POI":
      return { ...state, selectedPoi: null, poiResults: [] };
    default:
      return state;
  }
}

function handleIndoor(state: MapUIState, action: any): MapUIState {
  switch (action.type) {
    case "OPEN_INDOOR":
      return {
        ...state,
        panel: "indoor",
        indoorBuildingId: action.buildingId,
        indoorFloor: action.floor,
        indoorSelectedRoom: null,
      };
    case "CLOSE_INDOOR":
      return { ...state, panel: "directions" };
    case "SET_INDOOR_FLOOR":
      return { ...state, indoorFloor: action.floor, indoorSelectedRoom: null };
    case "OPEN_ROOM_INFO":
      return { ...state, panel: "room-info", indoorSelectedRoom: action.room };
    case "BACK_TO_INDOOR":
      return { ...state, panel: "indoor", indoorSelectedRoom: null };
    default:
      return state;
  }
}

export function mapUIReducer(
  state: MapUIState,
  action: MapUIAction,
): MapUIState {
  switch (action.type) {
    case "OPEN_SEARCH":
      return { ...state, panel: "search", searchOrigin: "default" };

    case "CLOSE_PANEL":
      return handleClosePanel(state);

    case "SELECT_BUILDING":
      return {
        ...state,
        selectedBuilding: action.building,
        panel: "none",
        searchOrigin: "default",
        destinationRoom: null,
        route: null,
        routeLoading: false,
        routeError: null,
      };

    case "DESELECT_BUILDING":
      return { ...state, selectedBuilding: null };

    case "OPEN_DIRECTIONS":
      return handleOpenDirections(state, action);

    case "SET_CURRENT_BUILDING":
      return { ...state, currentBuilding: action.building };

    case "TAP_MAP":
      if (state.panel === "directions" || state.panel === "steps") return state;
      return { ...state, selectedBuilding: null, selectedPoi: null };

    case "OPEN_SEARCH_FOR_START":
      return { ...state, panel: "search", searchOrigin: "directions" };

    case "SET_START_BUILDING":
      return handleSetStartBuilding(state, action);

    case "RESET_START_BUILDING":
      return {
        ...state,
        startBuilding: null,
        startRoom: null,
        route: null,
        routeLoading: false,
        routeError: null,
      };

    case "RETURN_TO_DIRECTIONS":
      return { ...state, panel: "directions", searchOrigin: "default" };

    case "POI_LOADING":
    case "POI_LOADED":
    case "POI_ERROR":
    case "SELECT_POI":
    case "CLEAR_POI":
      return handlePois(state, action);

    case "OPEN_INDOOR":
    case "CLOSE_INDOOR":
    case "SET_INDOOR_FLOOR":
    case "OPEN_ROOM_INFO":
    case "BACK_TO_INDOOR":
      return handleIndoor(state, action);

    case "SET_TRAVEL_MODE":
      return handleTravelMode(state, action.mode);
    case "RESET_TRAVEL_MODE":
      return {
        ...state,
        travelMode: null,
        route: null,
        routeLoading: false,
        routeError: null,
      };
    case "ROUTE_LOADING":
      return { ...state, routeLoading: true, routeError: null };

    case "ROUTE_LOADED":
      return {
        ...state,
        route: action.route,
        routeLoading: false,
        activeStepIndex: -1,
        activeIndoorStepIndex: -1,
      };

    case "ROUTE_ERROR":
      return {
        ...state,
        routeLoading: false,
        routeError: action.error,
        route: null,
        activeStepIndex: -1,
        activeIndoorStepIndex: -1,
      };

    case "OPEN_STEPS":
      return { ...state, panel: "steps" };

    case "CLOSE_STEPS":
      return { ...state, panel: "directions" };

    case "SET_ACTIVE_STEP":
      return { ...state, activeStepIndex: action.index };

    case "SET_ACTIVE_INDOOR_STEP":
      return { ...state, activeIndoorStepIndex: action.index };

    case "SET_SHUTTLE_ELIGIBLE":
      return { ...state, shuttleEligible: action.eligible };

    case "SET_DEPARTURE_CONFIG":
      return {
        ...state,
        departureConfig: action.config,
        route: null,
        routeLoading: false,
        routeError: null,
        travelMode: null,
      };

    case "BACK_TO_SEARCH":
      return { ...state, panel: "search", poiResults: [], poiError: null };

    case "ROOM_LOADED":
      return { ...state, roomResults: action.results, panel: "room-results" };

    case "ROOM_BACK":
      return { ...state, panel: "search", roomResults: [] };

    case "SET_ACCESSIBILITY_MODE":
      return {
        ...state,
        accessibilityMode: action.enabled,
        route: null,
        routeLoading: false,
        routeError: null,
        activeStepIndex: -1,
        activeIndoorStepIndex: -1,
      };

    default:
      return state;
  }
}
