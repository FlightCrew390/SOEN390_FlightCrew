import {
  initialMapUIState,
  mapUIReducer,
} from "../../src/reducers/mapUIReducer";
import { MapUIState } from "../../src/state/MapUIState";
import { Building } from "../../src/types/Building";

const mockBuilding: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
};

const mockBuilding2: Building = {
  campus: "LOY",
  buildingCode: "CC",
  buildingName: "Central",
  buildingLongName: "Central Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.458,
  longitude: -73.64,
};

describe("mapUIReducer", () => {
  it("has correct initial state", () => {
    expect(initialMapUIState).toEqual({
      panel: "none",
      selectedBuilding: null,
      currentBuilding: null,
      searchOrigin: "default",
      startBuilding: null,
    });
  });

  it("OPEN_SEARCH sets panel to search and searchOrigin to default", () => {
    const state = mapUIReducer(initialMapUIState, { type: "OPEN_SEARCH" });
    expect(state.panel).toBe("search");
    expect(state.searchOrigin).toBe("default");
  });

  it("CLOSE_PANEL sets panel to none and searchOrigin to default", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    const state = mapUIReducer(prev, { type: "CLOSE_PANEL" });
    expect(state.panel).toBe("none");
    expect(state.searchOrigin).toBe("default");
  });

  it("SELECT_BUILDING sets selectedBuilding and closes panel", () => {
    const prev: MapUIState = { ...initialMapUIState, panel: "search" };
    const state = mapUIReducer(prev, {
      type: "SELECT_BUILDING",
      building: mockBuilding,
    });
    expect(state.selectedBuilding).toBe(mockBuilding);
    expect(state.panel).toBe("none");
    expect(state.searchOrigin).toBe("default");
  });

  it("DESELECT_BUILDING clears selectedBuilding", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      selectedBuilding: mockBuilding,
    };
    const state = mapUIReducer(prev, { type: "DESELECT_BUILDING" });
    expect(state.selectedBuilding).toBeNull();
  });

  it("OPEN_DIRECTIONS sets panel to directions and selectedBuilding", () => {
    const state = mapUIReducer(initialMapUIState, {
      type: "OPEN_DIRECTIONS",
      building: mockBuilding,
    });
    expect(state.panel).toBe("directions");
    expect(state.selectedBuilding).toBe(mockBuilding);
    expect(state.startBuilding).toBeNull();
  });

  it("SET_CURRENT_BUILDING sets current building", () => {
    const state = mapUIReducer(initialMapUIState, {
      type: "SET_CURRENT_BUILDING",
      building: mockBuilding,
    });
    expect(state.currentBuilding).toBe(mockBuilding);
  });

  it("SET_CURRENT_BUILDING can set to null", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      currentBuilding: mockBuilding,
    };
    const state = mapUIReducer(prev, {
      type: "SET_CURRENT_BUILDING",
      building: null,
    });
    expect(state.currentBuilding).toBeNull();
  });

  it("TAP_MAP deselects building when panel is not directions", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "none",
      selectedBuilding: mockBuilding,
    };
    const state = mapUIReducer(prev, { type: "TAP_MAP" });
    expect(state.selectedBuilding).toBeNull();
  });

  it("TAP_MAP does nothing when panel is directions", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "directions",
      selectedBuilding: mockBuilding,
    };
    const state = mapUIReducer(prev, { type: "TAP_MAP" });
    expect(state).toBe(prev); // exact same reference
    expect(state.selectedBuilding).toBe(mockBuilding);
  });

  it("OPEN_SEARCH_FOR_START sets panel to search and searchOrigin to directions", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "directions",
    };
    const state = mapUIReducer(prev, { type: "OPEN_SEARCH_FOR_START" });
    expect(state.panel).toBe("search");
    expect(state.searchOrigin).toBe("directions");
  });

  it("SET_START_BUILDING sets start building and returns to directions panel", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    const state = mapUIReducer(prev, {
      type: "SET_START_BUILDING",
      building: mockBuilding2,
    });
    expect(state.panel).toBe("directions");
    expect(state.searchOrigin).toBe("default");
    expect(state.startBuilding).toBe(mockBuilding2);
  });

  it("RETURN_TO_DIRECTIONS sets panel to directions and resets searchOrigin", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    const state = mapUIReducer(prev, { type: "RETURN_TO_DIRECTIONS" });
    expect(state.panel).toBe("directions");
    expect(state.searchOrigin).toBe("default");
  });

  it("returns current state for unknown action type", () => {
    const state = mapUIReducer(initialMapUIState, {
      type: "UNKNOWN_ACTION" as any,
    });
    expect(state).toBe(initialMapUIState);
  });
});
