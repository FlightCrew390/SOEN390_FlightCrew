import { Building } from "../types/Building";
type Panel = "none" | "search" | "directions";

export interface MapUIState {
  panel: Panel; // mutual exclusion built-in
  selectedBuilding: Building | null;
  currentBuilding: Building | null;
}

export type MapUIAction =
  | { type: "OPEN_SEARCH" }
  | { type: "CLOSE_PANEL" }
  | { type: "SELECT_BUILDING"; building: Building }
  | { type: "DESELECT_BUILDING" }
  | { type: "OPEN_DIRECTIONS"; building: Building }
  | { type: "SET_CURRENT_BUILDING"; building: Building | null }
  | { type: "TAP_MAP" };
