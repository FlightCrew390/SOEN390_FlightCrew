import {
  floorPlanAssetReducer,
  floorSelectorReducer,
  initialFloorPlanAssetState,
  initialFloorSelectorState,
} from "../../src/reducers/indoorFloorViewReducer";

describe("floorPlanAssetReducer", () => {
  it("RESET sets state to initial", () => {
    const prevState = { assetLoadFailed: true };
    const nextState = floorPlanAssetReducer(prevState, { type: "RESET" });
    expect(nextState).toEqual(initialFloorPlanAssetState);
  });

  it("LOAD_FAILED sets assetLoadFailed to true", () => {
    const nextState = floorPlanAssetReducer(initialFloorPlanAssetState, {
      type: "LOAD_FAILED",
    });
    expect(nextState.assetLoadFailed).toBe(true);
  });

  it("unknown action returns state", () => {
    const nextState = floorPlanAssetReducer(initialFloorPlanAssetState, {
      type: "UNKNOWN",
    } as any);
    expect(nextState).toBe(initialFloorPlanAssetState);
  });
});

describe("floorSelectorReducer", () => {
  it("TOGGLE toggles floorOpen", () => {
    const nextState = floorSelectorReducer(initialFloorSelectorState, {
      type: "TOGGLE",
    });
    expect(nextState.floorOpen).toBe(true);

    const nextState2 = floorSelectorReducer(nextState, { type: "TOGGLE" });
    expect(nextState2.floorOpen).toBe(false);
  });

  it("CLOSE sets state to initial", () => {
    const prevState = { floorOpen: true };
    const nextState = floorSelectorReducer(prevState, { type: "CLOSE" });
    expect(nextState).toEqual(initialFloorSelectorState);
  });

  it("unknown action returns state", () => {
    const nextState = floorSelectorReducer(initialFloorSelectorState, {
      type: "UNKNOWN",
    } as any);
    expect(nextState).toBe(initialFloorSelectorState);
  });
});
