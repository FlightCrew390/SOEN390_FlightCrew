import { Building } from "../types/Building";

export type LocationType = "building" | "restaurant";

export interface SearchPanelState {
  locationType: LocationType;
  query: string;
  dropdownOpen: boolean;
  showAutocomplete: boolean;
  autocompleteIdx: number;
  selectedResult: Building | null;
}

export type SearchPanelAction =
  | { type: "TOGGLE_DROPDOWN" }
  | { type: "SELECT_LOCATION_TYPE"; locationType: LocationType }
  | { type: "UPDATE_QUERY"; text: string }
  | { type: "CLEAR_QUERY" }
  | { type: "SELECT_AUTOCOMPLETE"; building: Building }
  | { type: "FOCUS_INPUT" }
  | { type: "BLUR_INPUT" }
  | { type: "PANEL_CLOSED" };
