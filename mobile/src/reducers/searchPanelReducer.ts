import { SearchPanelAction, SearchPanelState } from "../state/SearchPanelState";

export const initialSearchPanelState: SearchPanelState = {
  locationType: "building",
  query: "",
  dropdownOpen: false,
  showAutocomplete: false,
  autocompleteIdx: -1,
  selectedResult: null,
  radiusKm: null,
  radiusDropdownOpen: false,
};

export function searchPanelReducer(
  state: SearchPanelState,
  action: SearchPanelAction,
): SearchPanelState {
  switch (action.type) {
    case "TOGGLE_DROPDOWN":
      return { ...state, dropdownOpen: !state.dropdownOpen, radiusDropdownOpen: false };

    case "SELECT_LOCATION_TYPE":
      return {
        ...state,
        locationType: action.locationType,
        dropdownOpen: false,
        query: "",
        showAutocomplete: false,
        selectedResult: null,
        radiusKm: null,
        radiusDropdownOpen: false,
      };

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
      return { ...state, radiusDropdownOpen: !state.radiusDropdownOpen, dropdownOpen: false };

    case "SELECT_RADIUS":
      return { ...state, radiusKm: action.radiusKm, radiusDropdownOpen: false };

    default:
      return state;
  }
}
