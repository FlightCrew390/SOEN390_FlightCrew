import {
  AmenitySelectorAction,
  AmenitySelectorState,
  FloorPlanAssetAction,
  FloorPlanAssetState,
  FloorSelectorAction,
  FloorSelectorState,
} from "../state/IndoorFloorViewState";

export const initialFloorPlanAssetState: FloorPlanAssetState = {
  assetLoadFailed: false,
};

export function floorPlanAssetReducer(
  state: FloorPlanAssetState,
  action: FloorPlanAssetAction,
): FloorPlanAssetState {
  switch (action.type) {
    case "RESET":
      return initialFloorPlanAssetState;
    case "LOAD_FAILED":
      return { assetLoadFailed: true };
    default:
      return state;
  }
}

export const initialFloorSelectorState: FloorSelectorState = {
  floorOpen: false,
};

export function floorSelectorReducer(
  state: FloorSelectorState,
  action: FloorSelectorAction,
): FloorSelectorState {
  switch (action.type) {
    case "TOGGLE":
      return { floorOpen: !state.floorOpen };
    case "CLOSE":
      return initialFloorSelectorState;
    default:
      return state;
  }
}

export const initialAmenitySelectorState: AmenitySelectorState = {
  amenityOpen: false,
  amenityPanelExpanded: false,
};

export function amenitySelectorReducer(
  state: AmenitySelectorState,
  action: AmenitySelectorAction,
): AmenitySelectorState {
  switch (action.type) {
    case "TOGGLE_OPEN":
      return { ...state, amenityOpen: !state.amenityOpen };
    case "TOGGLE_EXPANDED":
      return { ...state, amenityPanelExpanded: !state.amenityPanelExpanded };
    default:
      return state;
  }
}
