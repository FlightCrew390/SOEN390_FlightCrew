import { Building } from "../types/Building";
import { RouteInfo, TravelMode } from "../types/Directions";
import { PointOfInterest } from "../types/PointOfInterest";

type Panel = "none" | "search" | "directions" | "steps" | "poi-results";
export type SearchOrigin = "default" | "directions";

export interface MapUIState {
  panel: Panel;
  selectedBuilding: Building | null;
  currentBuilding: Building | null;
  searchOrigin: SearchOrigin;
  startBuilding: Building | null;
  // Directions route data
  travelMode: TravelMode | null;
  route: RouteInfo | null;
  routeLoading: boolean;
  routeError: string | null;
  // POI search data
  poiResults: PointOfInterest[];
  selectedPoi: PointOfInterest | null;
  poiLoading: boolean;
  poiError: string | null;
}

export type MapUIAction =
  | { type: "OPEN_SEARCH" }
  | { type: "CLOSE_PANEL" }
  | { type: "SELECT_BUILDING"; building: Building }
  | { type: "DESELECT_BUILDING" }
  | { type: "OPEN_DIRECTIONS"; building: Building }
  | { type: "SET_CURRENT_BUILDING"; building: Building | null }
  | { type: "TAP_MAP" }
  | { type: "OPEN_SEARCH_FOR_START" }
  | { type: "SET_START_BUILDING"; building: Building }
  | { type: "RESET_START_BUILDING" }
  | { type: "RETURN_TO_DIRECTIONS" }
  | { type: "SET_TRAVEL_MODE"; mode: TravelMode }
  | { type: "RESET_TRAVEL_MODE"; mode: null }
  | { type: "ROUTE_LOADING" }
  | { type: "ROUTE_LOADED"; route: RouteInfo | null }
  | { type: "ROUTE_ERROR"; error: string }
  | { type: "OPEN_STEPS" }
  | { type: "CLOSE_STEPS" }
  | { type: "POI_LOADING" }
  | { type: "POI_LOADED"; results: PointOfInterest[] }
  | { type: "POI_ERROR"; error: string }
  | { type: "SELECT_POI"; poi: PointOfInterest }
  | { type: "CLEAR_POI" }
  | { type: "BACK_TO_SEARCH" };
