import { SearchPanelAction, SearchPanelState } from "../state/SearchPanelState";
import { SECONDARY_LOCATION_OPTIONS } from "../constants/searchPanel";

export const initialSearchPanelState: SearchPanelState = {
  locationType: "building",
  query: "",
  dropdownOpen: false,
  showAutocomplete: false,
  autocompleteIdx: -1,
  selectedResult: null,
  radiusKm: null,
  radiusDropdownOpen: false,
  classroomBuildingId: null,
  classroomBuildingDropdownOpen: false,
  filtersExpanded: false,
};

export function searchPanelReducer(
  state: SearchPanelState,
  action: SearchPanelAction,
): SearchPanelState {
  switch (action.type) {
    case "TOGGLE_DROPDOWN":
      return {
        ...state,
        dropdownOpen: !state.dropdownOpen,
        radiusDropdownOpen: false,
      };

    case "SELECT_LOCATION_TYPE": {
      const isSecondary = SECONDARY_LOCATION_OPTIONS.some(
        (o) => o.key === action.locationType,
      );
      return {
        ...state,
        locationType: action.locationType,
        dropdownOpen: false,
        filtersExpanded: isSecondary ? true : state.filtersExpanded,
        query: "",
        showAutocomplete: false,
        selectedResult: null,
        radiusKm: null,
        radiusDropdownOpen: false,
      };
    }

    case "UPDATE_QUERY":
      return {
        ...state,
        query: action.text,
        dropdownOpen: false,
        showAutocomplete: true,
        autocompleteIdx: -1,
        selectedResult: null,
      };

    case "CLEAR_QUERY":
      return {
        ...state,
        query: "",
        showAutocomplete: false,
        selectedResult: null,
      };

    case "SELECT_AUTOCOMPLETE":
      return {
        ...state,
        selectedResult: action.building,
        query: action.building.buildingLongName,
        showAutocomplete: false,
      };

    case "FOCUS_INPUT":
      return { ...state, showAutocomplete: true };

    case "BLUR_INPUT":
      return { ...state, showAutocomplete: false };

    case "PANEL_CLOSED":
      return { ...state, dropdownOpen: false, radiusDropdownOpen: false };

    case "TOGGLE_RADIUS_DROPDOWN":
      return {
        ...state,
        radiusDropdownOpen: !state.radiusDropdownOpen,
        dropdownOpen: false,
      };

    case "SELECT_RADIUS":
      return { ...state, radiusKm: action.radiusKm, radiusDropdownOpen: false };

    case "TOGGLE_CLASSROOM_BUILDING_DROPDOWN":
      return {
        ...state,
        classroomBuildingDropdownOpen: !state.classroomBuildingDropdownOpen,
        dropdownOpen: false,
      };

    case "SELECT_CLASSROOM_BUILDING":
      return {
        ...state,
        classroomBuildingId: action.buildingId,
        classroomBuildingDropdownOpen: false,
      };

    case "TOGGLE_FILTERS_EXPANDED":
      return { ...state, filtersExpanded: !state.filtersExpanded };

    default:
      return state;
  }
}
