import { MapUIAction, MapUIState } from "../state/MapUIState";
export const initialMapUIState: MapUIState = {
  panel: "none",
  selectedBuilding: null,
  currentBuilding: null,
};

export function mapUIReducer(
  state: MapUIState,
  action: MapUIAction,
): MapUIState {
  switch (action.type) {
    case "OPEN_SEARCH":
      return { ...state, panel: "search" };

    case "CLOSE_PANEL":
      return { ...state, panel: "none" };

    case "SELECT_BUILDING":
      return { ...state, selectedBuilding: action.building, panel: "none" };

    case "DESELECT_BUILDING":
      return { ...state, selectedBuilding: null };

    case "OPEN_DIRECTIONS":
      return {
        ...state,
        panel: "directions",
        selectedBuilding: action.building,
      };

    case "SET_CURRENT_BUILDING":
      return { ...state, currentBuilding: action.building };

    case "TAP_MAP":
      // Only deselect if directions aren't showing
      if (state.panel === "directions") return state;
      return { ...state, selectedBuilding: null };

    default:
      return state;
  }
}
