import { MapUIAction, MapUIState } from "../state/MapUIState";
export const initialMapUIState: MapUIState = {
  panel: "none",
  selectedBuilding: null,
  currentBuilding: null,
  searchOrigin: "default",
  startBuilding: null,
};

export function mapUIReducer(
  state: MapUIState,
  action: MapUIAction,
): MapUIState {
  switch (action.type) {
    case "OPEN_SEARCH":
      return { ...state, panel: "search", searchOrigin: "default" };

    case "CLOSE_PANEL":
      return { ...state, panel: "none", searchOrigin: "default" };

    case "SELECT_BUILDING":
      return {
        ...state,
        selectedBuilding: action.building,
        panel: "none",
        searchOrigin: "default",
      };

    case "DESELECT_BUILDING":
      return { ...state, selectedBuilding: null };

    case "OPEN_DIRECTIONS":
      return {
        ...state,
        panel: "directions",
        selectedBuilding: action.building,
        startBuilding: null,
      };

    case "SET_CURRENT_BUILDING":
      return { ...state, currentBuilding: action.building };

    case "TAP_MAP":
      // Only deselect if directions aren't showing
      if (state.panel === "directions") return state;
      return { ...state, selectedBuilding: null };

    case "OPEN_SEARCH_FOR_START":
      return { ...state, panel: "search", searchOrigin: "directions" };

    case "SET_START_BUILDING":
      return {
        ...state,
        panel: "directions",
        searchOrigin: "default",
        startBuilding: action.building,
      };

    case "RETURN_TO_DIRECTIONS":
      return { ...state, panel: "directions", searchOrigin: "default" };

    default:
      return state;
  }
}
