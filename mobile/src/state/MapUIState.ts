import { Building } from "../types/Building";
import { RouteInfo, TravelMode } from "../types/Directions";

type Panel = "none" | "search" | "directions";
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
  | { type: "ROUTE_ERROR"; error: string };
