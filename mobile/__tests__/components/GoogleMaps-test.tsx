import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import GoogleMaps from "../../src/components/LocationScreen/GoogleMaps";
import { Building, StructureType } from "../../src/types/Building";
import { hallBuilding, testBuildings } from "../fixtures";

// ── Mock all hooks ──

const mockDispatch = jest.fn();
const mockSelectBuilding = jest.fn();
const mockOpenDirections = jest.fn();
const mockHandleSearch = jest.fn();
const mockHandleTravelModeChange = jest.fn();
const mockSelectPoi = jest.fn();
const mockClearPoi = jest.fn();
const mockHandleDepartureConfigChange = jest.fn();

const defaultMapUIState = {
  panel: "none" as const,
  selectedBuilding: null,
  currentBuilding: null,
  searchOrigin: "default" as const,
  startBuilding: null,
  travelMode: null,
  route: null,
  routeLoading: false,
  routeError: null,
  poiResults: [],
  selectedPoi: null,
  poiLoading: false,
  poiError: null,
};

type MapUIState = Omit<
  typeof defaultMapUIState,
  "panel" | "searchOrigin" | "poiResults" | "selectedPoi"
> & {
  panel: "none" | "directions" | "steps" | "search" | "poi-results";
  searchOrigin: "default" | "directions";
  poiResults: any[];
  selectedPoi: any;
};

let mockMapUIState: MapUIState = { ...defaultMapUIState };

jest.mock("../../src/hooks/useMapUI", () => ({
  useMapUI: () => ({
    state: mockMapUIState,
    dispatch: mockDispatch,
    userCoords: null,
    selectBuilding: mockSelectBuilding,
    openDirections: mockOpenDirections,
    handleSearch: mockHandleSearch,
    handleTravelModeChange: mockHandleTravelModeChange,
    selectPoi: mockSelectPoi,
    clearPoi: mockClearPoi,
    handleDepartureConfigChange: mockHandleDepartureConfigChange,
  }),
}));

const mockHandleMapReady = jest.fn();
const mockHandleRegionChangeComplete = jest.fn();
const mockHandleRecenter = jest.fn();
const mockAnimateToBuilding = jest.fn();

jest.mock("../../src/hooks/useMapCamera", () => ({
  useMapCamera: () => ({
    handleMapReady: mockHandleMapReady,
    handleRegionChangeComplete: mockHandleRegionChangeComplete,
    handleRecenter: mockHandleRecenter,
    animateToBuilding: mockAnimateToBuilding,
  }),
}));

// Mock BuildingContext
const mockUseBuildingData = jest.fn();
jest.mock("../../src/contexts/BuildingContext", () => ({
  useBuildings: () => mockUseBuildingData(),
}));

// Mock LocationContext
const mockUseCurrentLocation = jest.fn();
jest.mock("../../src/contexts/LocationContext", () => ({
  useLocation: () => mockUseCurrentLocation(),
}));

// Mock findBuildingByLocation utility
const mockFindBuildingByLocation = jest.fn();
jest.mock("../../src/utils/findBuildingByLocation", () => ({
  findBuildingByLocation: (...args: any[]) =>
    mockFindBuildingByLocation(...args),
}));

// Mock navigation – controllable per test
const mockSetParams = jest.fn();
let mockRouteParams: Record<string, any> = {};

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ setParams: mockSetParams }),
  useRoute: () => ({ params: mockRouteParams }),
}));

// ── Mock leaf components that we do NOT have source for ──

// BuildingMarker (leaf of BuildingLayer)
jest.mock("../../src/components/LocationScreen/BuildingMarker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID={`building-marker-${props.building.buildingCode}`}>
        <Text testID={`bm-current-${props.building.buildingCode}`}>
          {String(props.isCurrentBuilding)}
        </Text>
        <Text testID={`bm-selected-${props.building.buildingCode}`}>
          {String(props.isSelected)}
        </Text>
        <Text testID={`bm-directions-${props.building.buildingCode}`}>
          {String(props.isDirectionsOpen)}
        </Text>
        <Pressable
          testID={`bm-select-${props.building.buildingCode}`}
          onPress={props.onSelect}
        />
        <Pressable
          testID={`bm-direction-${props.building.buildingCode}`}
          onPress={props.onDirectionPress}
        />
      </View>
    ),
  };
});

// BuildingPolygon (leaf of BuildingLayer)
jest.mock("../../src/components/LocationScreen/BuildingPolygon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID={`building-polygon-${props.building.buildingCode}`} />
    ),
  };
});

// UserLocationMarker (we don't have source)
jest.mock("../../src/components/LocationScreen/UserLocationMarker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="user-location-marker"
        {...{ latitude: props.latitude, longitude: props.longitude }}
      />
    ),
  };
});

// DirectionPanel – expose all props and callbacks
jest.mock("../../src/components/LocationScreen/DirectionPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="direction-panel">
        <Text testID="dp-visible">{String(props.visible)}</Text>
        <Text testID="dp-show-steps">{String(props.showSteps)}</Text>
        <Text testID="dp-building">
          {props.building?.buildingCode ?? "null"}
        </Text>
        <Text testID="dp-start-building">
          {props.startBuilding?.buildingCode ?? "null"}
        </Text>
        <Text testID="dp-has-route">{String(props.route != null)}</Text>
        <Text testID="dp-route-loading">{String(props.routeLoading)}</Text>
        <Text testID="dp-route-error">{props.routeError ?? "null"}</Text>
        <Text testID="dp-travel-mode">{props.travelMode ?? "null"}</Text>
        <Pressable testID="dp-close" onPress={props.onClose} />
        <Pressable testID="dp-open-search" onPress={props.onOpenSearch} />
        <Pressable testID="dp-reset-start" onPress={props.onResetStart} />
        <Pressable testID="dp-show-steps-btn" onPress={props.onShowSteps} />
        <Pressable testID="dp-hide-steps-btn" onPress={props.onHideSteps} />
        <Pressable
          testID="dp-travel-mode-change"
          onPress={() => props.onTravelModeChange("WALK")}
        />
      </View>
    ),
  };
});

// SearchPanel – expose onClose and all callbacks
jest.mock("../../src/components/LocationScreen/SearchPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="search-panel">
        <Text testID="sp-visible">{String(props.visible)}</Text>
        <Pressable testID="sp-close" onPress={props.onClose} />
        <Pressable
          testID="sp-select-building"
          onPress={() =>
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            props.onSelectBuilding(require("../fixtures").hallBuilding)
          }
        />
        <Pressable
          testID="sp-search"
          onPress={() => props.onSearch("Hall", "building")}
        />
        <Pressable testID="sp-close" onPress={props.onClose} />
      </View>
    ),
  };
});

// FontAwesome5 (used by MapControls)
jest.mock("@expo/vector-icons/FontAwesome5", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View testID={`icon-${props.name}`} />,
  };
});

// ── Mock react-native-maps (MapView + Polyline) ──

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { forwardRef } = require("react");

  const MockMapView = forwardRef((props: any, ref: any) => (
    <View testID="map-view" ref={ref} {...props}>
      {props.children}
    </View>
  ));
  MockMapView.displayName = "MockMapView";

  const MockPolyline = (props: any) => (
    <View
      testID="route-polyline"
      {...{
        coordinateCount: props.coordinates?.length,
        strokeColor: props.strokeColor,
        hasDash: props.lineDashPattern != null,
      }}
    />
  );

  return {
    __esModule: true,
    default: MockMapView,
    Polyline: MockPolyline,
    PROVIDER_GOOGLE: "google",
    PROVIDER_DEFAULT: null,
  };
});

// ── Mock constants (MAP_CONFIG + COLORS) ──

jest.mock("../../src/constants", () => ({
  MAP_CONFIG: {
    defaultCampusRegion: {
      latitude: 45.4973,
      longitude: -73.5789,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
  },
  COLORS: {
    concordiaMaroon: "#912338",
    concordiaMaroonLight: "#d88a96",
    mapPolylineWalk: "#007AFF",
  },
}));

// ── Mock styles ──

jest.mock("../../src/styles/GoogleMaps", () => ({
  __esModule: true,
  default: {
    container: {},
    map: {},
    loadingOverlay: {},
    loadingText: {},
    errorOverlay: {},
    errorText: {},
    searchButton: {},
    searchButtonOpen: {},
    recenterButton: {},
  },
}));

// ── Mock state import for MapControls ──

jest.mock("../../src/state/MapUIState", () => ({}));

// ── Test data ──

const mockBuildings: Building[] = [
  {
    structureType: StructureType.Building,
    campus: "SGW",
    buildingCode: "H",
    buildingName: "Hall Building",
    buildingLongName: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd. W.",
    latitude: 45.4973,
    longitude: -73.5789,
    accessibilityInfo:
      "Wheelchair accessible entrance at 1455 De Maisonneuve Blvd. W.",
  },
  {
    structureType: StructureType.Building,
    campus: "SGW",
    buildingCode: "EV",
    buildingName: "Engineering Building",
    buildingLongName:
      "Engineering, Computer Science and Visual Arts Integrated Complex",
    address: "1515 St. Catherine W.",
    latitude: 45.4957,
    longitude: -73.5773,
    accessibilityInfo:
      "Wheelchair accessible entrance at 1515 St. Catherine W.",
  },
];

const mockLocation = { coords: { latitude: 45.4973, longitude: -73.5789 } };

// ── Standalone tests (basic rendering) ──

beforeEach(() => {
  jest.clearAllMocks();
  mockMapUIState = { ...defaultMapUIState };
  mockRouteParams = {};
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
  });
  mockUseCurrentLocation.mockReturnValue({
    location: null,
    loading: false,
    error: null,
  });
  mockFindBuildingByLocation.mockReturnValue(null);
});

test("renders map view", () => {
  render(<GoogleMaps mapRef={React.createRef()} />);
  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("renders loading indicator when buildings are loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);
  expect(screen.getByText("Loading buildings...")).toBeTruthy();
});

test("renders loading indicator when location is loading", () => {
  mockUseCurrentLocation.mockReturnValue({
    location: null,
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);
  expect(screen.getByText("Getting your location...")).toBeTruthy();
});

test("renders error message when error occurs", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: "Failed to fetch buildings",
  });

  render(<GoogleMaps mapRef={React.createRef()} />);
  expect(screen.getByText("Failed to fetch buildings")).toBeTruthy();
});

test("renders building markers for each building", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByTestId("building-marker-H")).toBeTruthy();
  expect(screen.getByTestId("building-marker-EV")).toBeTruthy();
  expect(screen.getByTestId("building-polygon-H")).toBeTruthy();
  expect(screen.getByTestId("building-polygon-EV")).toBeTruthy();
});

test("does not render loading overlay when not loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);
  expect(screen.queryByText(/Loading/)).toBeNull();
});

test("does not render error overlay when no error", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);
  expect(screen.queryByText(/Error:/)).toBeNull();
});

test("renders empty map when no buildings", () => {
  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByTestId("map-view")).toBeTruthy();
  expect(screen.queryByTestId(/building-marker-/)).toBeNull();
});

test("shows loading overlay alongside map when loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByText("Loading buildings...")).toBeTruthy();
  expect(screen.getByTestId("map-view")).toBeTruthy();
});

describe("GoogleMaps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMapUIState = { ...defaultMapUIState };
    mockRouteParams = {};

    mockUseCurrentLocation.mockReturnValue({
      location: mockLocation,
      loading: false,
      error: null,
    });

    mockUseBuildingData.mockReturnValue({
      buildings: testBuildings,
      loading: false,
      error: null,
    });

    mockFindBuildingByLocation.mockReturnValue(null);
  });

  // ── Renders child components ──

  it("renders all core child components", () => {
    render(<GoogleMaps />);
    expect(screen.getByTestId("map-view")).toBeTruthy();
    expect(screen.getAllByTestId(/building-marker-/).length).toBeGreaterThan(0);
    expect(screen.getByTestId("direction-panel")).toBeTruthy();
    expect(screen.getByTestId("search-panel")).toBeTruthy();
    expect(screen.getByLabelText("Search campus buildings")).toBeTruthy();
    expect(screen.getByLabelText("Recenter map on my location")).toBeTruthy();
  });

  it("renders UserLocationMarker when location exists", () => {
    render(<GoogleMaps />);
    expect(screen.getByTestId("user-location-marker")).toBeTruthy();
  });

  it("does not render UserLocationMarker when no location", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.queryByTestId("user-location-marker")).toBeNull();
  });

  it("passes location coordinates to UserLocationMarker", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: { coords: { latitude: 45.5, longitude: -73.6 } },
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    const marker = screen.getByTestId("user-location-marker");
    expect(marker.props.latitude).toBe(45.5);
    expect(marker.props.longitude).toBe(-73.6);
  });

  // ── MapView callback wiring ──

  it("passes handleMapReady to MapView onMapReady", () => {
    render(<GoogleMaps />);
    const mapView = screen.getByTestId("map-view");
    mapView.props.onMapReady();
    expect(mockHandleMapReady).toHaveBeenCalledTimes(1);
  });

  it("passes handleRegionChangeComplete to MapView onRegionChangeComplete", () => {
    render(<GoogleMaps />);
    const mapView = screen.getByTestId("map-view");
    const region = {
      latitude: 45.5,
      longitude: -73.6,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapView.props.onRegionChangeComplete(region);
    expect(mockHandleRegionChangeComplete).toHaveBeenCalledWith(region);
  });

  it("uses the external mapRef when provided", () => {
    const externalRef = React.createRef<any>();
    render(<GoogleMaps mapRef={externalRef} />);
    expect(screen.getByTestId("map-view")).toBeTruthy();
  });

  it("works without an external mapRef (uses internal ref)", () => {
    render(<GoogleMaps />);
    expect(screen.getByTestId("map-view")).toBeTruthy();
  });

  // ── Panel visibility wiring ──

  it("passes visible=false to DirectionPanel when panel is 'none'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-visible").children[0]).toBe("false");
  });

  it("passes visible=true to DirectionPanel when panel is 'directions'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "directions" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-visible").children[0]).toBe("true");
  });

  it("passes visible=true to DirectionPanel when panel is 'steps'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "steps" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-visible").children[0]).toBe("true");
  });

  it("passes showSteps=true to DirectionPanel when panel is 'steps'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "steps" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-show-steps").children[0]).toBe("true");
  });

  it("passes showSteps=false to DirectionPanel when panel is 'directions'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "directions" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-show-steps").children[0]).toBe("false");
  });

  it("passes visible=true to SearchPanel when panel is 'search'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "search" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("sp-visible").children[0]).toBe("true");
  });

  it("passes visible=false to SearchPanel when panel is not 'search'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("sp-visible").children[0]).toBe("false");
  });

  // ── DirectionPanel prop wiring ──

  it("passes selectedBuilding to DirectionPanel", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      selectedBuilding: mockBuildings[0],
    } as any;
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-building").children[0]).toBe("H");
  });

  it("passes null building to DirectionPanel when none selected", () => {
    mockMapUIState = { ...defaultMapUIState, selectedBuilding: null };
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-building").children[0]).toBe("null");
  });

  it("passes startBuilding to DirectionPanel", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      startBuilding: mockBuildings[1],
    } as any;
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-start-building").children[0]).toBe("EV");
  });

  it("passes route to DirectionPanel", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      route: {
        coordinates: [
          { latitude: 45.4973, longitude: -73.5789 },
          { latitude: 45.4957, longitude: -73.5773 },
        ],
        duration: 300,
        distance: 500,
      },
    } as any;
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-has-route").children[0]).toBe("true");
  });

  it("passes routeLoading to DirectionPanel", () => {
    mockMapUIState = { ...defaultMapUIState, routeLoading: true } as any;
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-route-loading").children[0]).toBe("true");
  });

  it("passes routeError to DirectionPanel", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      routeError: "Route failed",
    } as any;
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-route-error").children[0]).toBe(
      "Route failed",
    );
  });

  it("passes travelMode to DirectionPanel", () => {
    mockMapUIState = { ...defaultMapUIState, travelMode: "WALK" } as any;
    render(<GoogleMaps />);
    expect(screen.getByTestId("dp-travel-mode").children[0]).toBe("WALK");
  });

  // ── DirectionPanel callback wiring ──

  it("dispatches CLOSE_PANEL when DirectionPanel onClose is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-close"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_PANEL" });
  });

  it("dispatches OPEN_SEARCH_FOR_START when DirectionPanel onOpenSearch is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-open-search"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "OPEN_SEARCH_FOR_START",
    });
  });

  it("dispatches RESET_START_BUILDING when DirectionPanel onResetStart is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-reset-start"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "RESET_START_BUILDING",
    });
  });

  it("dispatches OPEN_STEPS when DirectionPanel onShowSteps is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-show-steps-btn"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "OPEN_STEPS" });
  });

  it("dispatches CLOSE_STEPS when DirectionPanel onHideSteps is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-hide-steps-btn"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_STEPS" });
  });

  it("calls handleTravelModeChange when DirectionPanel changes travel mode", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-travel-mode-change"));
    expect(mockHandleTravelModeChange).toHaveBeenCalledWith("WALK");
  });

  // ── SearchPanel onClose wiring ──

  it("dispatches CLOSE_PANEL when SearchPanel closes with default origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "default",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-close"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_PANEL" });
  });

  it("dispatches RETURN_TO_DIRECTIONS when SearchPanel closes with directions origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-close"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "RETURN_TO_DIRECTIONS",
    });
  });

  // ── MapControls behavior (real component) ──

  it("hides search button when panel is 'directions'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "directions" };
    render(<GoogleMaps />);
    expect(screen.queryByLabelText("Search campus buildings")).toBeNull();
    expect(screen.queryByLabelText("Close search")).toBeNull();
  });

  it("shows search button when panel is not 'directions'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    render(<GoogleMaps />);
    expect(screen.getByLabelText("Search campus buildings")).toBeTruthy();
  });

  it("shows close label on search button when panel is 'search'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "search" };
    render(<GoogleMaps />);
    expect(screen.getByLabelText("Close search")).toBeTruthy();
    expect(screen.queryByLabelText("Search campus buildings")).toBeNull();
  });

  it("renders recenter button when location exists", () => {
    render(<GoogleMaps />);
    expect(screen.getByLabelText("Recenter map on my location")).toBeTruthy();
  });

  it("does not render recenter button when no location", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.queryByLabelText("Recenter map on my location")).toBeNull();
  });

  // ── MapControls icon wiring (real component) ──

  it("renders search icon when panel is not search", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("icon-search")).toBeTruthy();
  });

  it("renders times icon when panel is search with default origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "default",
    };
    render(<GoogleMaps />);
    expect(screen.getByTestId("icon-times")).toBeTruthy();
  });

  it("renders chevron-left icon when panel is search with directions origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    render(<GoogleMaps />);
    expect(screen.getByTestId("icon-chevron-left")).toBeTruthy();
  });

  it("renders location-arrow icon for recenter button", () => {
    render(<GoogleMaps />);
    expect(screen.getByTestId("icon-location-arrow")).toBeTruthy();
  });

  // ── MapControls callbacks dispatch correctly ──

  it("dispatches OPEN_SEARCH when search button is pressed", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByLabelText("Search campus buildings"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "OPEN_SEARCH" });
  });

  it("dispatches CLOSE_PANEL when close-search is pressed (default origin)", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "default",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByLabelText("Close search"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_PANEL" });
  });

  it("dispatches RETURN_TO_DIRECTIONS when close-search is pressed (directions origin)", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByLabelText("Close search"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "RETURN_TO_DIRECTIONS",
    });
  });

  it("calls handleRecenter when recenter is pressed", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByLabelText("Recenter map on my location"));
    expect(mockHandleRecenter).toHaveBeenCalledTimes(1);
  });

  it("passes onRecenter prop through to handleRecenter", () => {
    const onRecenter = jest.fn();
    render(<GoogleMaps onRecenter={onRecenter} />);
    fireEvent.press(screen.getByLabelText("Recenter map on my location"));
    expect(mockHandleRecenter).toHaveBeenCalledWith(onRecenter);
  });

  // ── Building selection wiring via BuildingMarker onSelect ──

  it("calls animateToBuilding and selectBuilding when BuildingMarker onSelect fires", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("bm-select-H"));
    expect(mockAnimateToBuilding).toHaveBeenCalledWith(mockBuildings[0]);
    expect(mockSelectBuilding).toHaveBeenCalledWith(mockBuildings[0]);
  });

  // ── Direction press wiring via BuildingMarker onDirectionPress ──

  it("calls animateToBuilding and openDirections when BuildingMarker onDirectionPress fires", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("bm-direction-EV"));
    expect(mockAnimateToBuilding).toHaveBeenCalledWith(mockBuildings[1]);
    expect(mockOpenDirections).toHaveBeenCalledWith(mockBuildings[1]);
  });

  // ── SearchPanel building selection wiring ──

  it("calls animateToBuilding and selectBuilding when SearchPanel selects (default origin)", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "default",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-select-building"));
    expect(mockAnimateToBuilding).toHaveBeenCalledWith(hallBuilding);
    expect(mockSelectBuilding).toHaveBeenCalledWith(hallBuilding);
  });

  // ── Search submission wiring ──

  it("calls handleSearch on search submit and animates on match", () => {
    mockHandleSearch.mockReturnValue(hallBuilding);
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-search"));
    expect(mockHandleSearch).toHaveBeenCalledWith(
      "Hall",
      "building",
      undefined,
    );
    expect(mockAnimateToBuilding).toHaveBeenCalledWith(hallBuilding);
    expect(mockSelectBuilding).toHaveBeenCalledWith(hallBuilding);
  });

  it("does not animate when search returns no match", () => {
    mockHandleSearch.mockReturnValue(null);
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-search"));
    expect(mockAnimateToBuilding).not.toHaveBeenCalled();
    expect(mockSelectBuilding).not.toHaveBeenCalled();
  });

  // ── Map tap ──

  it("dispatches TAP_MAP when map is pressed", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("map-view"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "TAP_MAP" });
  });

  // ── Loading / error overlays (real MapOverlays) ──

  it("shows building loading text when buildings are loading", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: true,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Loading buildings...")).toBeTruthy();
  });

  it("shows location loading text when only location is loading", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: testBuildings,
      loading: false,
      error: null,
    });
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: true,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Getting your location...")).toBeTruthy();
  });

  it("shows error when not loading", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: false,
      error: "Failed to load buildings",
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Failed to load buildings")).toBeTruthy();
  });

  it("does not show error while loading", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: true,
      error: "Failed to load buildings",
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Loading buildings...")).toBeTruthy();
    expect(screen.queryByText("Failed to load buildings")).toBeNull();
  });

  it("shows location error when not loading", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: false,
      error: "GPS unavailable",
    });
    render(<GoogleMaps />);
    expect(screen.getByText("GPS unavailable")).toBeTruthy();
  });

  it("returns null from MapOverlays when not loading and no error", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: testBuildings,
      loading: false,
      error: null,
    });
    mockUseCurrentLocation.mockReturnValue({
      location: mockLocation,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.queryByText(/Loading/)).toBeNull();
    expect(screen.queryByText(/unavailable/)).toBeNull();
  });

  // ── RoutePolyline (real component) ──

  it("does not render route polyline when route is null", () => {
    mockMapUIState = { ...defaultMapUIState, route: null };
    render(<GoogleMaps />);
    expect(screen.queryByTestId("route-polyline")).toBeNull();
  });

  it("renders route polyline when route has coordinates", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      route: {
        coordinates: [
          { latitude: 45.4973, longitude: -73.5789 },
          { latitude: 45.4957, longitude: -73.5773 },
        ],
        duration: 300,
        distance: 500,
      },
      travelMode: "WALK",
    } as any;
    render(<GoogleMaps />);
    const polyline = screen.getByTestId("route-polyline");
    expect(polyline).toBeTruthy();
    expect(polyline.props.hasDash).toBe(true);
  });

  it("renders polyline without dash pattern for non-WALK mode", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      route: {
        coordinates: [
          { latitude: 45.4973, longitude: -73.5789 },
          { latitude: 45.4957, longitude: -73.5773 },
        ],
        duration: 300,
        distance: 500,
      },
      travelMode: "DRIVE",
    } as any;
    render(<GoogleMaps />);
    const polyline = screen.getByTestId("route-polyline");
    expect(polyline).toBeTruthy();
    expect(polyline.props.hasDash).toBe(false);
  });

  it("does not render polyline when route has fewer than 2 coordinates", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      route: {
        coordinates: [{ latitude: 45.4973, longitude: -73.5789 }],
        duration: 0,
        distance: 0,
      },
    } as any;
    render(<GoogleMaps />);
    expect(screen.queryByTestId("route-polyline")).toBeNull();
  });

  // ── BuildingLayer integration (real component) ──

  it("passes isDirectionsOpen to building markers when panel is 'directions'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "directions" };
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByTestId("bm-directions-H").children[0]).toBe("true");
    expect(screen.getByTestId("bm-directions-EV").children[0]).toBe("true");
  });

  it("passes isDirectionsOpen=false when panel is not 'directions'", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByTestId("bm-directions-H").children[0]).toBe("false");
  });

  it("marks the selected building correctly", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      selectedBuilding: mockBuildings[0],
    } as any;
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByTestId("bm-selected-H").children[0]).toBe("true");
    expect(screen.getByTestId("bm-selected-EV").children[0]).toBe("false");
  });

  it("marks the current building correctly", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      currentBuilding: mockBuildings[1],
    } as any;
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByTestId("bm-current-H").children[0]).toBe("false");
    expect(screen.getByTestId("bm-current-EV").children[0]).toBe("true");
  });

  it("renders both polygon and marker for each building", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    mockBuildings.forEach((b) => {
      expect(
        screen.getByTestId(`building-polygon-${b.buildingCode}`),
      ).toBeTruthy();
      expect(
        screen.getByTestId(`building-marker-${b.buildingCode}`),
      ).toBeTruthy();
    });
  });

  // ── SearchPanel in directions mode ──

  it("dispatches SET_START_BUILDING when selecting from search in directions origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-select-building"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_START_BUILDING",
      building: hallBuilding,
    });
  });

  // ── onDirectionPress wiring ──

  it("calls animateToBuilding and openDirections when BuildingLayer onDirectionPress fires", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("bl-direction-press"));
    expect(mockAnimateToBuilding).toHaveBeenCalledWith(hallBuilding);
    expect(mockOpenDirections).toHaveBeenCalledWith(hallBuilding);
  });

  it("calls animateToBuilding and selectBuilding when BuildingLayer onSelect fires", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("bl-select"));
    expect(mockAnimateToBuilding).toHaveBeenCalledWith(hallBuilding);
    expect(mockSelectBuilding).toHaveBeenCalledWith(hallBuilding);
  });

  // ── DirectionPanel callback wiring ──

  it("dispatches OPEN_SEARCH_FOR_START when DirectionPanel onOpenSearch fires", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-open-search"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "OPEN_SEARCH_FOR_START",
    });
  });

  it("dispatches RESET_START_BUILDING when DirectionPanel onResetStart fires", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-reset-start"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "RESET_START_BUILDING" });
  });

  it("dispatches OPEN_STEPS when DirectionPanel onShowSteps fires", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-btn-show-steps"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "OPEN_STEPS" });
  });

  it("dispatches CLOSE_STEPS when DirectionPanel onHideSteps fires", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("dp-btn-hide-steps"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_STEPS" });
  });

  // ── SearchPanel onClose wiring ──

  it("dispatches CLOSE_PANEL when SearchPanel onClose fires with default origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "default",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-close"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_PANEL" });
  });

  it("dispatches RETURN_TO_DIRECTIONS when SearchPanel onClose fires with directions origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-close"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "RETURN_TO_DIRECTIONS" });
    fireEvent.press(screen.getByTestId("sp-select-building"));
    expect(mockAnimateToBuilding).not.toHaveBeenCalled();
    expect(mockSelectBuilding).not.toHaveBeenCalled();
  });

  // ── Deep-link useEffect (directionsTo param) ──

  describe("deep-link from Calendar", () => {
    it("does nothing when directionsTo is not set", () => {
      mockRouteParams = {};
      render(<GoogleMaps />);
      expect(mockFindBuildingByLocation).not.toHaveBeenCalled();
      expect(mockAnimateToBuilding).not.toHaveBeenCalled();
      expect(mockOpenDirections).not.toHaveBeenCalled();
    });

    it("does nothing when directionsTo is set but buildings are empty", () => {
      mockRouteParams = { directionsTo: "Hall Building" };
      mockUseBuildingData.mockReturnValue({
        buildings: [],
        loading: false,
        error: null,
      });
      render(<GoogleMaps />);
      expect(mockFindBuildingByLocation).not.toHaveBeenCalled();
      expect(mockAnimateToBuilding).not.toHaveBeenCalled();
      expect(mockOpenDirections).not.toHaveBeenCalled();
    });

    it("calls findBuildingByLocation, animateToBuilding, and openDirections when matched", () => {
      mockRouteParams = { directionsTo: "Hall Building" };
      mockFindBuildingByLocation.mockReturnValue(hallBuilding);
      render(<GoogleMaps />);
      expect(mockFindBuildingByLocation).toHaveBeenCalledWith(
        "Hall Building",
        testBuildings,
      );
      expect(mockAnimateToBuilding).toHaveBeenCalledWith(hallBuilding);
      expect(mockOpenDirections).toHaveBeenCalledWith(hallBuilding);
    });

    it("clears the directionsTo param after handling a match", () => {
      mockRouteParams = { directionsTo: "Hall Building" };
      mockFindBuildingByLocation.mockReturnValue(hallBuilding);
      render(<GoogleMaps />);
      expect(mockSetParams).toHaveBeenCalledWith({
        directionsTo: undefined,
      });
    });

    it("does not animate or open directions when no match is found", () => {
      mockRouteParams = { directionsTo: "Unknown Building" };
      mockFindBuildingByLocation.mockReturnValue(null);
      render(<GoogleMaps />);
      expect(mockFindBuildingByLocation).toHaveBeenCalledWith(
        "Unknown Building",
        testBuildings,
      );
      expect(mockAnimateToBuilding).not.toHaveBeenCalled();
      expect(mockOpenDirections).not.toHaveBeenCalled();
    });

    it("still clears directionsTo param even when no match is found", () => {
      mockRouteParams = { directionsTo: "Unknown Building" };
      mockFindBuildingByLocation.mockReturnValue(null);
      render(<GoogleMaps />);
      expect(mockSetParams).toHaveBeenCalledWith({
        directionsTo: undefined,
      });
    });
  });
});
