export interface FloorPlanAssetState {
  assetLoadFailed: boolean;
}

export type FloorPlanAssetAction = { type: "RESET" } | { type: "LOAD_FAILED" };

export interface FloorSelectorState {
  floorOpen: boolean;
}

export type FloorSelectorAction = { type: "TOGGLE" } | { type: "CLOSE" };
