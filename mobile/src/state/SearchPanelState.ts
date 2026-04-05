import { Building } from "../types/Building";

export type LocationType =
  | "building"
  | "classroom"
  | "restaurant"
  | "cafe"
  | "pharmacy"
  | "bar"
  | "grocery";

export function isPoi(type: LocationType): boolean {
  return type !== "building" && type !== "classroom";
}

export function isClassroom(type: LocationType): boolean {
  return type === "classroom";
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
  // Classroom-specific
  classroomBuildingId: string | null;
  classroomBuildingDropdownOpen: boolean;
  // Filter visibility
  filtersExpanded: boolean;
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
  | { type: "SELECT_RADIUS"; radiusKm: number | null }
  | { type: "TOGGLE_CLASSROOM_BUILDING_DROPDOWN" }
  | { type: "SELECT_CLASSROOM_BUILDING"; buildingId: string | null }
  | { type: "TOGGLE_FILTERS_EXPANDED" };
