import { Building } from "../types/Building";

export type LocationType =
  | "building"
  | "restaurant"
  | "cafe"
  | "pharmacy"
  | "bar"
  | "grocery";

export function isPoi(type: LocationType): boolean {
  return type !== "building";
}

export interface SearchPanelState {
  locationType: LocationType;
  query: string;
  dropdownOpen: boolean;
  showAutocomplete: boolean;
  autocompleteIdx: number;
  selectedResult: Building | null;
  radiusKm: number | null;
  radiusDropdownOpen: boolean;
}

export type SearchPanelAction =
  | { type: "TOGGLE_DROPDOWN" }
  | { type: "SELECT_LOCATION_TYPE"; locationType: LocationType }
  | { type: "UPDATE_QUERY"; text: string }
  | { type: "CLEAR_QUERY" }
  | { type: "SELECT_AUTOCOMPLETE"; building: Building }
  | { type: "FOCUS_INPUT" }
  | { type: "BLUR_INPUT" }
  | { type: "PANEL_CLOSED" }
  | { type: "TOGGLE_RADIUS_DROPDOWN" }
  | { type: "SELECT_RADIUS"; radiusKm: number | null };
