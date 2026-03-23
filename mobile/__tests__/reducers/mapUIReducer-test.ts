import {
  initialMapUIState,
  mapUIReducer,
} from "../../src/reducers/mapUIReducer";
import { MapUIState } from "../../src/state/MapUIState";
import { Building, StructureType } from "../../src/types/Building";
import { DEFAULT_DEPARTURE_CONFIG } from "../../src/types/Directions";
import { PointOfInterest } from "../../src/types/PointOfInterest";

const mockBuilding: Building = {
  structureType: StructureType.Building,
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  accessibilityInfo:
    "Wheelchair accessible entrance at 1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
};

const mockBuilding2: Building = {
  structureType: StructureType.Building,
  campus: "LOY",
  buildingCode: "CC",
  buildingName: "Central",
  buildingLongName: "Central Building",
  accessibilityInfo: "Wheelchair accessible entrance at 7141 Sherbrooke St. W.",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.458,
  longitude: -73.64,
};

const mockPoi: PointOfInterest = {
  name: "Café Gentile",
  category: "cafe",
  campus: "SGW",
  address: "4126 Ste-Catherine St W",
  latitude: 45.496,
  longitude: -73.5795,
  description: "Italian-style café",
};

describe("mapUIReducer", () => {
  it("has correct initial state", () => {
    expect(initialMapUIState).toEqual({
      destinationRoom: null,
      indoorBuildingId: null,
      indoorFloor: null,
      indoorSelectedRoom: null,
      roomResults: [],
      panel: "none",
      selectedBuilding: null,
      currentBuilding: null,
      searchOrigin: "default",
      startBuilding: null,
      startRoom: null,
      travelMode: null,
      departureConfig: { option: "now", date: expect.any(Date) },
      route: null,
      routeLoading: false,
      routeError: null,
      shuttleEligible: false,
      poiResults: [],
      selectedPoi: null,
      poiLoading: false,
      poiError: null,
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
      travelMode: "DRIVE",
    };
    const state = mapUIReducer(prev, { type: "CLOSE_PANEL" });
    expect(state.panel).toBe("none");
    expect(state.searchOrigin).toBe("default");
    expect(state.travelMode).toBeNull();
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
    const prev: MapUIState = {
      ...initialMapUIState,
      travelMode: "DRIVE",
    };
    const state = mapUIReducer(prev, {
      type: "OPEN_DIRECTIONS",
      building: mockBuilding,
    });
    expect(state.panel).toBe("directions");
    expect(state.selectedBuilding).toBe(mockBuilding);
    expect(state.startBuilding).toBeNull();
    expect(state.travelMode).toBeNull();
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

  it("RESET_START_BUILDING clears startBuilding back to null", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "directions",
      startBuilding: mockBuilding2,
    };
    const state = mapUIReducer(prev, { type: "RESET_START_BUILDING" });
    expect(state.startBuilding).toBeNull();
    expect(state.panel).toBe("directions");
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

  it("SET_TRAVEL_MODE updates mode and clears route data", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      travelMode: "WALK",
      route: {
        coordinates: [],
        distanceMeters: 100,
        durationSeconds: 60,
        steps: [],
      },
      routeLoading: true,
      routeError: "old error",
    };
    const state = mapUIReducer(prev, {
      type: "SET_TRAVEL_MODE",
      mode: "DRIVE",
    });
    expect(state.travelMode).toBe("DRIVE");
    expect(state.route).toBeNull();
    expect(state.routeLoading).toBe(false);
    expect(state.routeError).toBeNull();
  });

  it("ROUTE_LOADING sets routeLoading true and clears error", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      routeLoading: false,
      routeError: "old error",
    };
    const state = mapUIReducer(prev, { type: "ROUTE_LOADING" });
    expect(state.routeLoading).toBe(true);
    expect(state.routeError).toBeNull();
  });

  it("ROUTE_LOADED sets route and clears loading", () => {
    const route = {
      coordinates: [{ latitude: 45.5, longitude: -73.58 }],
      distanceMeters: 500,
      durationSeconds: 120,
      steps: [],
    };
    const prev: MapUIState = {
      ...initialMapUIState,
      routeLoading: true,
    };
    const state = mapUIReducer(prev, { type: "ROUTE_LOADED", route });
    expect(state.route).toBe(route);
    expect(state.routeLoading).toBe(false);
  });

  it("ROUTE_ERROR sets error, clears loading and route", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      routeLoading: true,
      route: {
        coordinates: [],
        distanceMeters: 100,
        durationSeconds: 60,
        steps: [],
      },
    };
    const state = mapUIReducer(prev, {
      type: "ROUTE_ERROR",
      error: "Quota exceeded",
    });
    expect(state.routeLoading).toBe(false);
    expect(state.routeError).toBe("Quota exceeded");
    expect(state.route).toBeNull();
  });

  it("OPEN_STEPS sets panel to steps", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "directions",
    };
    const state = mapUIReducer(prev, { type: "OPEN_STEPS" });
    expect(state.panel).toBe("steps");
  });

  it("CLOSE_STEPS sets panel to directions", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "steps",
    };
    const state = mapUIReducer(prev, { type: "CLOSE_STEPS" });
    expect(state.panel).toBe("directions");
  });

  it("TAP_MAP does nothing when panel is steps", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "steps",
      selectedBuilding: mockBuilding,
    };
    const state = mapUIReducer(prev, { type: "TAP_MAP" });
    expect(state).toBe(prev);
  });

  it("returns current state for unknown action type", () => {
    const state = mapUIReducer(initialMapUIState, {
      type: "UNKNOWN_ACTION" as any,
    });
    expect(state).toBe(initialMapUIState);
  });

  it("RESET_TRAVEL_MODE resets travel mode and clears route", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      travelMode: "TRANSIT",
      route: { legs: [] } as any,
    };
    const state = mapUIReducer(prev, { type: "RESET_TRAVEL_MODE", mode: null });
    expect(state.travelMode).toBeNull();
    expect(state.route).toBeNull();
  });

  it("OPEN_STEPS changes panel to steps", () => {
    const state = mapUIReducer(initialMapUIState, { type: "OPEN_STEPS" });
    expect(state.panel).toBe("steps");
  });

  it("CLOSE_STEPS changes panel to directions", () => {
    const state = mapUIReducer(initialMapUIState, { type: "CLOSE_STEPS" });
    expect(state.panel).toBe("directions");
  });

  it("ROOM_LOADED sets roomResults and changes panel to room-results", () => {
    const results = [{ roomId: "H-8" }] as any;
    const state = mapUIReducer(initialMapUIState, {
      type: "ROOM_LOADED",
      results,
    });
    expect(state.roomResults).toBe(results);
    expect(state.panel).toBe("room-results");
  });

  it("ROOM_BACK changes panel to search and clears roomResults", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      roomResults: [{ roomId: "H-8" }] as any,
      panel: "room-results",
    };
    const state = mapUIReducer(prev, { type: "ROOM_BACK" });
    expect(state.panel).toBe("search");
    expect(state.roomResults).toEqual([]);
  });

  it("OPEN_INDOOR sets indoor params and clears indoorSelectedRoom", () => {
    const state = mapUIReducer(initialMapUIState, {
      type: "OPEN_INDOOR",
      buildingId: "H",
      floor: 8,
    });
    expect(state.panel).toBe("indoor");
    expect(state.indoorBuildingId).toBe("H");
    expect(state.indoorFloor).toBe(8);
    expect(state.indoorSelectedRoom).toBeNull();
  });

  it("CLOSE_INDOOR changes panel to directions", () => {
    const state = mapUIReducer(initialMapUIState, { type: "CLOSE_INDOOR" });
    expect(state.panel).toBe("directions");
  });

  it("SET_INDOOR_FLOOR sets indoor floor and clears indoorSelectedRoom", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      indoorSelectedRoom: {} as any,
    };
    const state = mapUIReducer(prev, { type: "SET_INDOOR_FLOOR", floor: 9 });
    expect(state.indoorFloor).toBe(9);
    expect(state.indoorSelectedRoom).toBeNull();
  });

  it("OPEN_ROOM_INFO changes panel and sets indoorSelectedRoom", () => {
    const room = { roomId: "H-9" } as any;
    const state = mapUIReducer(initialMapUIState, {
      type: "OPEN_ROOM_INFO",
      room,
    });
    expect(state.panel).toBe("room-info");
    expect(state.indoorSelectedRoom).toBe(room);
  });

  it("BACK_TO_INDOOR changes panel and clears indoorSelectedRoom", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "room-info",
      indoorSelectedRoom: {} as any,
    };
    const state = mapUIReducer(prev, { type: "BACK_TO_INDOOR" });
    expect(state.panel).toBe("indoor");
    expect(state.indoorSelectedRoom).toBeNull();
  });

  it("SET_DEPARTURE_CONFIG updates departureConfig and clears route state", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      route: {
        coordinates: [],
        distanceMeters: 100,
        durationSeconds: 60,
        steps: [],
      },
      routeLoading: true,
      routeError: "old error",
    };
    const newConfig = {
      option: "depart_at" as const,
      date: new Date("2026-03-03T09:00:00"),
    };
    const state = mapUIReducer(prev, {
      type: "SET_DEPARTURE_CONFIG",
      config: newConfig,
    });
    expect(state.departureConfig).toBe(newConfig);
    expect(state.route).toBeNull();
    expect(state.routeLoading).toBe(false);
    expect(state.routeError).toBeNull();
  });

  it("CLOSE_PANEL also resets departureConfig to default", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "directions",
      departureConfig: { option: "depart_at" as const, date: new Date() },
    };
    const state = mapUIReducer(prev, { type: "CLOSE_PANEL" });
    expect(state.departureConfig.option).toBe(DEFAULT_DEPARTURE_CONFIG.option);
  });

  // ── POI actions ──

  it("POI_LOADING sets poiLoading true and clears error", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      poiError: "old",
    };
    const state = mapUIReducer(prev, { type: "POI_LOADING" });
    expect(state.poiLoading).toBe(true);
    expect(state.poiError).toBeNull();
  });

  it("POI_LOADED sets results, clears loading, sets panel to poi-results", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      poiLoading: true,
    };
    const state = mapUIReducer(prev, {
      type: "POI_LOADED",
      results: [mockPoi],
    });
    expect(state.poiResults).toEqual([mockPoi]);
    expect(state.poiLoading).toBe(false);
    expect(state.panel).toBe("poi-results");
  });

  it("POI_ERROR sets error, clears loading and results", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      poiLoading: true,
      poiResults: [mockPoi],
    };
    const state = mapUIReducer(prev, {
      type: "POI_ERROR",
      error: "Failed",
    });
    expect(state.poiLoading).toBe(false);
    expect(state.poiError).toBe("Failed");
    expect(state.poiResults).toEqual([]);
  });

  it("SELECT_POI sets selectedPoi and panel to none", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "poi-results",
      poiResults: [mockPoi],
    };
    const state = mapUIReducer(prev, {
      type: "SELECT_POI",
      poi: mockPoi,
    });
    expect(state.selectedPoi).toBe(mockPoi);
    expect(state.panel).toBe("none");
  });

  it("CLEAR_POI clears selectedPoi and poiResults", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      selectedPoi: mockPoi,
      poiResults: [mockPoi],
    };
    const state = mapUIReducer(prev, { type: "CLEAR_POI" });
    expect(state.selectedPoi).toBeNull();
    expect(state.poiResults).toEqual([]);
  });

  it("BACK_TO_SEARCH sets panel to search and clears poi results", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "poi-results",
      poiResults: [mockPoi],
      poiError: "old",
    };
    const state = mapUIReducer(prev, { type: "BACK_TO_SEARCH" });
    expect(state.panel).toBe("search");
    expect(state.poiResults).toEqual([]);
    expect(state.poiError).toBeNull();
  });

  it("TAP_MAP clears selectedPoi", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "none",
      selectedPoi: mockPoi,
    };
    const state = mapUIReducer(prev, { type: "TAP_MAP" });
    expect(state.selectedPoi).toBeNull();
  });
  it("SET_DEPARTURE_CONFIG updates departureConfig and clears route state", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      route: {
        coordinates: [],
        distanceMeters: 100,
        durationSeconds: 60,
        steps: [],
      },
      routeLoading: true,
      routeError: "old error",
    };
    const newConfig = {
      option: "depart_at" as const,
      date: new Date("2026-03-03T09:00:00"),
    };
    const state = mapUIReducer(prev, {
      type: "SET_DEPARTURE_CONFIG",
      config: newConfig,
    });
    expect(state.departureConfig).toBe(newConfig);
    expect(state.route).toBeNull();
    expect(state.routeLoading).toBe(false);
    expect(state.routeError).toBeNull();
  });

  it("CLOSE_PANEL also resets departureConfig to default", () => {
    const prev: MapUIState = {
      ...initialMapUIState,
      panel: "directions",
      departureConfig: { option: "depart_at" as const, date: new Date() },
    };
    const state = mapUIReducer(prev, { type: "CLOSE_PANEL" });
    expect(state.departureConfig.option).toBe(DEFAULT_DEPARTURE_CONFIG.option);
  });
});
