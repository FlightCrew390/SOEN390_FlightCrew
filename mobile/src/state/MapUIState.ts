import { Building } from "../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  TravelMode,
} from "../types/Directions";
import { IndoorRoom } from "../types/IndoorRoom";
import { PointOfInterest } from "../types/PointOfInterest";

type Panel =
  | "none"
  | "search"
  | "directions"
  | "steps"
  | "poi-results"
  | "room-results"
  | "indoor"
  | "room-info";
export type SearchOrigin = "default" | "directions";

export interface MapUIState {
  panel: Panel;
  selectedBuilding: Building | null;
  currentBuilding: Building | null;
  searchOrigin: SearchOrigin;
  startBuilding: Building | null;
  // Directions route data
  travelMode: TravelMode | null;
  departureConfig: DepartureTimeConfig;
  route: RouteInfo | null;
  routeLoading: boolean;
  routeError: string | null;
  // Shuttle eligibility
  shuttleEligible: boolean;
  // POI search data
  poiResults: PointOfInterest[];
  selectedPoi: PointOfInterest | null;
  poiLoading: boolean;
  poiError: string | null;
  // Room search data
  roomResults: IndoorRoom[];
  // Indoor floor view
  indoorBuildingId: string | null;
  indoorFloor: number | null;
  indoorSelectedRoom: IndoorRoom | null;
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
  | { type: "SET_DEPARTURE_CONFIG"; config: DepartureTimeConfig }
  | { type: "ROUTE_LOADING" }
  | { type: "ROUTE_LOADED"; route: RouteInfo | null }
  | { type: "ROUTE_ERROR"; error: string }
  | { type: "OPEN_STEPS" }
  | { type: "CLOSE_STEPS" }
  | { type: "SET_SHUTTLE_ELIGIBLE"; eligible: boolean }
  | { type: "POI_LOADING" }
  | { type: "POI_LOADED"; results: PointOfInterest[] }
  | { type: "POI_ERROR"; error: string }
  | { type: "SELECT_POI"; poi: PointOfInterest }
  | { type: "CLEAR_POI" }
  | { type: "BACK_TO_SEARCH" }
  | { type: "ROOM_LOADED"; results: IndoorRoom[] }
  | { type: "ROOM_BACK" }
  | { type: "OPEN_INDOOR"; buildingId: string; floor: number }
  | { type: "CLOSE_INDOOR" }
  | { type: "SET_INDOOR_FLOOR"; floor: number }
  | { type: "OPEN_ROOM_INFO"; room: IndoorRoom }
  | { type: "BACK_TO_INDOOR" };
