import {
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
