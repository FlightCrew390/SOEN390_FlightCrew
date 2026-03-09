import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useDirections } from "../../src/hooks/useDirections";
import { useMapUI } from "../../src/hooks/useMapUI";
import {
  hallBuilding,
  libraryBuilding,
  loyolaBuilding,
  testBuildings,
} from "../fixtures";

// Mock useDirections so it doesn't try to fetch
jest.mock("../../src/hooks/useDirections", () => ({
  useDirections: jest.fn(),
}));

// Mock findCurrentBuilding and calculateDistance (used by getClosestCampusId)
const mockFindCurrentBuilding = jest.fn();
jest.mock("../../src/utils/buildingDetection", () => ({
  ...jest.requireActual("../../src/utils/buildingDetection"),
  findCurrentBuilding: (...args: any[]) => mockFindCurrentBuilding(...args),
  calculateDistance: jest.fn(() => 100),
}));

const mockFetchPois = jest.fn();
jest.mock("../../src/services/PoiService", () => ({
  PoiService: {
    fetchPois: (...args: any[]) => mockFetchPois(...args),
  },
}));

const mockHaversineDistance = jest.fn();
jest.mock("../../src/utils/distanceUtils", () => ({
  haversineDistance: (...args: any[]) => mockHaversineDistance(...args),
}));

const mockCafePoi = {
  name: "Test Cafe",
  category: "cafe",
  campus: "SGW",
  address: "123 Test St",
  latitude: 45.496,
  longitude: -73.5795,
  description: "Test cafe",
};

const mockRestaurantPoi = {
  name: "Test Restaurant",
  category: "restaurant",
  campus: "SGW",
  address: "456 Test St",
  latitude: 45.497,
  longitude: -73.58,
  description: "Test restaurant",
};

const mockLocation = {
  coords: { latitude: 45.4973, longitude: -73.5789 },
};

describe("useMapUI", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFindCurrentBuilding.mockReturnValue(null);
    mockFetchPois.mockReset();
    mockFetchPois.mockResolvedValue([]);
    mockHaversineDistance.mockReset();
  });

  // ── Initial state ──

  it("returns initial state with no panels open", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    expect(result.current.state.panel).toBe("none");
    expect(result.current.state.selectedBuilding).toBeNull();
    expect(result.current.state.currentBuilding).toBeNull();
    expect(result.current.state.travelMode).toBeNull();
    expect(result.current.state.route).toBeNull();
  });

  it("returns null userCoords when location is null", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    expect(result.current.userCoords).toBeNull();
  });

  it("derives userCoords from location", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, mockLocation));
    expect(result.current.userCoords).toEqual({
      latitude: 45.4973,
      longitude: -73.5789,
    });
  });

  // ── selectBuilding ──

  it("sets selectedBuilding and closes panel", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.selectBuilding(hallBuilding);
    });

    expect(result.current.state.selectedBuilding).toBe(hallBuilding);
    expect(result.current.state.panel).toBe("none");
  });

  // ── openDirections ──

  it("opens directions panel for a building", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.openDirections(hallBuilding);
    });

    expect(result.current.state.panel).toBe("directions");
    expect(result.current.state.selectedBuilding).toBe(hallBuilding);
    expect(result.current.state.startBuilding).toBeNull();
    expect(result.current.state.travelMode).toBeNull();
  });

  // ── handleTravelModeChange ──

  it("sets travel mode", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.handleTravelModeChange("WALK");
    });

    expect(result.current.state.travelMode).toBe("WALK");
  });

  it("resets travel mode when null is passed", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.handleTravelModeChange("DRIVE");
    });
    expect(result.current.state.travelMode).toBe("DRIVE");

    act(() => {
      result.current.handleTravelModeChange(null);
    });
    expect(result.current.state.travelMode).toBeNull();
  });

  // ── handleSearch ──

  it("returns matching building by buildingName", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("Hall", "building");
    expect(match).toBe(hallBuilding);
  });

  it("returns matching building by buildingCode", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("LB", "building");
    expect(match).toBe(libraryBuilding);
  });

  it("returns matching building by buildingLongName", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("Central", "building");
    expect(match).toBe(loyolaBuilding);
  });

  it("returns null when no building matches", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("Nonexistent", "building");
    expect(match).toBeNull();
  });

  it("returns null for empty query", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("", "building");
    expect(match).toBeNull();
  });

  it("returns null for non-building location type", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("Hall", "restaurant");
    expect(match).toBeNull();
  });

  it("search is case-insensitive", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const match = result.current.handleSearch("hall building", "building");
    expect(match).toBe(hallBuilding);
  });

  // ── dispatch (exposed for less common actions) ──

  it("can open search panel via dispatch", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.dispatch({ type: "OPEN_SEARCH" });
    });

    expect(result.current.state.panel).toBe("search");
    expect(result.current.state.searchOrigin).toBe("default");
  });

  it("can close panel via dispatch", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.dispatch({ type: "OPEN_SEARCH" });
    });
    expect(result.current.state.panel).toBe("search");

    act(() => {
      result.current.dispatch({ type: "CLOSE_PANEL" });
    });
    expect(result.current.state.panel).toBe("none");
  });

  it("TAP_MAP deselects building when not in directions/steps", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.selectBuilding(hallBuilding);
    });
    expect(result.current.state.selectedBuilding).toBe(hallBuilding);

    act(() => {
      result.current.dispatch({ type: "TAP_MAP" });
    });
    expect(result.current.state.selectedBuilding).toBeNull();
  });

  it("TAP_MAP does not deselect building when in directions panel", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.openDirections(hallBuilding);
    });

    act(() => {
      result.current.dispatch({ type: "TAP_MAP" });
    });
    expect(result.current.state.selectedBuilding).toBe(hallBuilding);
    expect(result.current.state.panel).toBe("directions");
  });

  // ── Current building detection ──

  it("sets currentBuilding when location and buildings are available", () => {
    mockFindCurrentBuilding.mockReturnValue(hallBuilding);
    const { result } = renderHook(() => useMapUI(testBuildings, mockLocation));
    expect(result.current.state.currentBuilding).toBe(hallBuilding);
  });

  it("sets currentBuilding to null when location is null", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    expect(result.current.state.currentBuilding).toBeNull();
  });

  // ── Start building flow ──

  it("can set and reset start building", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.openDirections(hallBuilding);
    });

    act(() => {
      result.current.dispatch({
        type: "SET_START_BUILDING",
        building: libraryBuilding,
      });
    });
    expect(result.current.state.startBuilding).toBe(libraryBuilding);
    expect(result.current.state.panel).toBe("directions");

    act(() => {
      result.current.dispatch({ type: "RESET_START_BUILDING" });
    });
    expect(result.current.state.startBuilding).toBeNull();
  });

  // ── POI search ──

  it("handleSearch with POI type returns null and triggers async fetch", () => {
    mockFetchPois.mockResolvedValue([mockCafePoi, mockRestaurantPoi]);
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const returnValue = result.current.handleSearch("", "cafe");
    expect(returnValue).toBeNull();
    expect(mockFetchPois).toHaveBeenCalled();
  });

  it("dispatches POI_LOADED with filtered results on fetch success", async () => {
    mockFetchPois.mockResolvedValue([mockCafePoi, mockRestaurantPoi]);
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.handleSearch("", "cafe");
    });

    await waitFor(() => {
      expect(result.current.state.panel).toBe("poi-results");
    });

    expect(result.current.state.poiResults).toEqual([mockCafePoi]);
    expect(result.current.state.poiLoading).toBe(false);
  });

  it("dispatches POI_ERROR on fetch failure", async () => {
    mockFetchPois.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.handleSearch("", "cafe");
    });

    await waitFor(() => {
      expect(result.current.state.poiError).toBe("Network error");
    });

    expect(result.current.state.poiLoading).toBe(false);
    expect(result.current.state.poiResults).toEqual([]);
  });

  it("dispatches generic POI_ERROR on non-Error rejection", async () => {
    mockFetchPois.mockRejectedValue("something went wrong");
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.handleSearch("", "cafe");
    });

    await waitFor(() => {
      expect(result.current.state.poiError).toBe("Failed to load POIs");
    });
  });

  it("filters POIs by radius when radiusKm and location are provided", async () => {
    mockFetchPois.mockResolvedValue([mockCafePoi]);
    mockHaversineDistance.mockReturnValue(0.5);
    const { result } = renderHook(() => useMapUI(testBuildings, mockLocation));

    act(() => {
      result.current.handleSearch("", "cafe", 1);
    });

    await waitFor(() => {
      expect(result.current.state.poiResults).toHaveLength(1);
    });
  });

  it("excludes POIs beyond radius", async () => {
    mockFetchPois.mockResolvedValue([mockCafePoi]);
    mockHaversineDistance.mockReturnValue(5);
    const { result } = renderHook(() => useMapUI(testBuildings, mockLocation));

    act(() => {
      result.current.handleSearch("", "cafe", 1);
    });

    await waitFor(() => {
      expect(result.current.state.panel).toBe("poi-results");
    });
    expect(result.current.state.poiResults).toHaveLength(0);
  });

  it("does not apply radius filter when radiusKm is null", async () => {
    mockFetchPois.mockResolvedValue([mockCafePoi]);
    const { result } = renderHook(() => useMapUI(testBuildings, mockLocation));

    act(() => {
      result.current.handleSearch("", "cafe", null);
    });

    await waitFor(() => {
      expect(result.current.state.poiResults).toHaveLength(1);
    });
    expect(mockHaversineDistance).not.toHaveBeenCalled();
  });

  // ── selectPoi / clearPoi ──

  it("selectPoi sets the selected POI", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));

    act(() => {
      result.current.selectPoi(mockCafePoi as any);
    });

    expect(result.current.state.selectedPoi).toBe(mockCafePoi);
    expect(result.current.state.panel).toBe("none");
  });
  describe("route callbacks passed to useDirections", () => {
    let capturedParams: any;

    beforeEach(() => {
      (useDirections as jest.Mock).mockImplementation((params: any) => {
        capturedParams = params;
      });
    });

    it("dispatches ROUTE_LOADING when onLoading is called", () => {
      const { result } = renderHook(() => useMapUI(testBuildings, null));
      act(() => {
        capturedParams.onLoading();
      });
      expect(result.current.state.routeLoading).toBe(true);
      expect(result.current.state.routeError).toBeNull();
    });

    it("dispatches ROUTE_LOADED when onLoaded is called", () => {
      const route = {
        coordinates: [],
        distanceMeters: 500,
        durationSeconds: 120,
        steps: [],
      };
      const { result } = renderHook(() => useMapUI(testBuildings, null));
      act(() => {
        capturedParams.onLoaded(route);
      });
      expect(result.current.state.route).toBe(route);
      expect(result.current.state.routeLoading).toBe(false);
    });

    it("dispatches ROUTE_ERROR when onError is called", () => {
      const { result } = renderHook(() => useMapUI(testBuildings, null));
      act(() => {
        capturedParams.onError("Network error");
      });
      expect(result.current.state.routeError).toBe("Network error");
      expect(result.current.state.routeLoading).toBe(false);
      expect(result.current.state.route).toBeNull();
    });
  });

  // ── handleDepartureConfigChange ──

  it("handleDepartureConfigChange dispatches SET_DEPARTURE_CONFIG", () => {
    const { result } = renderHook(() => useMapUI(testBuildings, null));
    const config = {
      option: "depart_at" as const,
      date: new Date("2026-03-03T09:00:00"),
    };
    act(() => {
      result.current.handleDepartureConfigChange(config);
    });
    expect(result.current.state.departureConfig).toBe(config);
    expect(result.current.state.route).toBeNull();
  });
});
