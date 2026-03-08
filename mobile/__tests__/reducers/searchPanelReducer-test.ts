import {
  initialSearchPanelState,
  searchPanelReducer,
} from "../../src/reducers/searchPanelReducer";
import { SearchPanelState } from "../../src/state/SearchPanelState";
import { Building, StructureType } from "../../src/types/Building";

const mockBuilding: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
  accessibilityInfo:
    "Wheelchair accessible entrance at 1455 De Maisonneuve Blvd. W.",
  structureType: StructureType.Building,
};

describe("searchPanelReducer", () => {
  it("has correct initial state", () => {
    expect(initialSearchPanelState).toEqual({
      locationType: "building",
      query: "",
      dropdownOpen: false,
      showAutocomplete: false,
      autocompleteIdx: -1,
      selectedResult: null,
      radiusKm: null,
      radiusDropdownOpen: false,
    });
  });

  it("TOGGLE_DROPDOWN toggles dropdownOpen", () => {
    const state = searchPanelReducer(initialSearchPanelState, {
      type: "TOGGLE_DROPDOWN",
    });
    expect(state.dropdownOpen).toBe(true);

    const state2 = searchPanelReducer(state, { type: "TOGGLE_DROPDOWN" });
    expect(state2.dropdownOpen).toBe(false);
  });

  it("SELECT_LOCATION_TYPE sets locationType and resets query state", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      query: "Hall",
      dropdownOpen: true,
      showAutocomplete: true,
      selectedResult: mockBuilding,
    };
    const state = searchPanelReducer(prev, {
      type: "SELECT_LOCATION_TYPE",
      locationType: "restaurant",
    });
    expect(state.locationType).toBe("restaurant");
    expect(state.dropdownOpen).toBe(false);
    expect(state.query).toBe("");
    expect(state.showAutocomplete).toBe(false);
    expect(state.selectedResult).toBeNull();
  });

  it("UPDATE_QUERY sets query and shows autocomplete", () => {
    const state = searchPanelReducer(initialSearchPanelState, {
      type: "UPDATE_QUERY",
      text: "Hall",
    });
    expect(state.query).toBe("Hall");
    expect(state.showAutocomplete).toBe(true);
    expect(state.dropdownOpen).toBe(false);
    expect(state.autocompleteIdx).toBe(-1);
    expect(state.selectedResult).toBeNull();
  });

  it("CLEAR_QUERY clears query and hides autocomplete", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      query: "Hall",
      showAutocomplete: true,
      selectedResult: mockBuilding,
    };
    const state = searchPanelReducer(prev, { type: "CLEAR_QUERY" });
    expect(state.query).toBe("");
    expect(state.showAutocomplete).toBe(false);
    expect(state.selectedResult).toBeNull();
  });

  it("SELECT_AUTOCOMPLETE sets result and query to buildingLongName", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      query: "Hal",
      showAutocomplete: true,
    };
    const state = searchPanelReducer(prev, {
      type: "SELECT_AUTOCOMPLETE",
      building: mockBuilding,
    });
    expect(state.selectedResult).toBe(mockBuilding);
    expect(state.query).toBe("Henry F. Hall Building");
    expect(state.showAutocomplete).toBe(false);
  });

  it("FOCUS_INPUT shows autocomplete", () => {
    const state = searchPanelReducer(initialSearchPanelState, {
      type: "FOCUS_INPUT",
    });
    expect(state.showAutocomplete).toBe(true);
  });

  it("BLUR_INPUT hides autocomplete", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      showAutocomplete: true,
    };
    const state = searchPanelReducer(prev, { type: "BLUR_INPUT" });
    expect(state.showAutocomplete).toBe(false);
  });

  it("PANEL_CLOSED closes dropdown", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      dropdownOpen: true,
    };
    const state = searchPanelReducer(prev, { type: "PANEL_CLOSED" });
    expect(state.dropdownOpen).toBe(false);
  });

  it("returns current state for unknown action type", () => {
    const state = searchPanelReducer(initialSearchPanelState, {
      type: "UNKNOWN_ACTION" as any,
    });
    expect(state).toBe(initialSearchPanelState);
  });

  // ── Radius actions ──

  it("TOGGLE_RADIUS_DROPDOWN toggles radiusDropdownOpen and closes main dropdown", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      dropdownOpen: true,
    };
    const state = searchPanelReducer(prev, { type: "TOGGLE_RADIUS_DROPDOWN" });
    expect(state.radiusDropdownOpen).toBe(true);
    expect(state.dropdownOpen).toBe(false);

    const state2 = searchPanelReducer(state, { type: "TOGGLE_RADIUS_DROPDOWN" });
    expect(state2.radiusDropdownOpen).toBe(false);
  });

  it("SELECT_RADIUS sets radiusKm and closes radius dropdown", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      radiusDropdownOpen: true,
    };
    const state = searchPanelReducer(prev, {
      type: "SELECT_RADIUS",
      radiusKm: 2,
    });
    expect(state.radiusKm).toBe(2);
    expect(state.radiusDropdownOpen).toBe(false);
  });

  it("SELECT_RADIUS can set null (no limit)", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      radiusKm: 5,
    };
    const state = searchPanelReducer(prev, {
      type: "SELECT_RADIUS",
      radiusKm: null,
    });
    expect(state.radiusKm).toBeNull();
  });

  it("SELECT_LOCATION_TYPE resets radius fields", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      locationType: "cafe",
      radiusKm: 2,
      radiusDropdownOpen: true,
    };
    const state = searchPanelReducer(prev, {
      type: "SELECT_LOCATION_TYPE",
      locationType: "restaurant",
    });
    expect(state.radiusKm).toBeNull();
    expect(state.radiusDropdownOpen).toBe(false);
  });

  it("TOGGLE_DROPDOWN closes radius dropdown", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      radiusDropdownOpen: true,
    };
    const state = searchPanelReducer(prev, { type: "TOGGLE_DROPDOWN" });
    expect(state.radiusDropdownOpen).toBe(false);
    expect(state.dropdownOpen).toBe(true);
  });

  it("PANEL_CLOSED closes both dropdowns", () => {
    const prev: SearchPanelState = {
      ...initialSearchPanelState,
      dropdownOpen: true,
      radiusDropdownOpen: true,
    };
    const state = searchPanelReducer(prev, { type: "PANEL_CLOSED" });
    expect(state.dropdownOpen).toBe(false);
    expect(state.radiusDropdownOpen).toBe(false);
  });
});
