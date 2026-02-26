import { Building } from "../types/Building";
type Panel = "none" | "search" | "directions";
export type SearchOrigin = "default" | "directions";

export interface MapUIState {
  panel: Panel; // mutual exclusion built-in
  selectedBuilding: Building | null;
  currentBuilding: Building | null;
  searchOrigin: SearchOrigin;
  startBuilding: Building | null;
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
  | { type: "RETURN_TO_DIRECTIONS" };
