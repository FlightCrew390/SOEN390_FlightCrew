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

// Remove duplicate mocks at the bottom of the import section
// Convert the tests to use the second set of mocks (mockUseBuildingData and mockUseCurrentLocation) consistently

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
  }),
}));

const mockHandleMapReady = jest.fn();
const mockHandleRegionChangeComplete = jest.fn();
const mockHandleRecenter = jest.fn();
const mockAnimateToBuilding = jest.fn();
const mockMapAnimateToRegion = jest.fn();

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

// Mock child components to be inspectable
jest.mock("../../src/components/LocationScreen/BuildingLayer", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="building-layer"
        {...{
          currentBuildingCode: props.currentBuildingCode,
          selectedBuildingCode: props.selectedBuildingCode,
          isDirectionsOpen: props.isDirectionsOpen,
          buildingCount: props.buildings.length,
        }}
      />
    ),
  };
});

jest.mock("../../src/components/LocationScreen/RoutePolyline", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View
        testID="route-polyline"
        {...{ hasRoute: props.route != null, travelMode: props.travelMode }}
      />
    ),
  };
});

jest.mock("../../src/components/LocationScreen/UserLocationMarker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View testID="user-location-marker" />,
  };
});

jest.mock("../../src/components/LocationScreen/MapOverlays", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="map-overlays">
        {props.isLoading && <Text>Loading</Text>}
        {props.error && <Text>{props.error}</Text>}
      </View>
    ),
  };
});

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
  },
];

const mockLocation = { coords: { latitude: 45.4973, longitude: -73.5789 } };

beforeEach(() => {
  jest.clearAllMocks();
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
});

test("renders map view", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("renders loading indicator when loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByText("Loading")).toBeTruthy();
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
  const buildingLayer = screen.getByTestId("building-layer");

  expect(buildingLayer.props.buildingCount).toBe(mockBuildings.length);
  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("does not render loading overlay when not loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.queryByText("Loading")).toBeNull();
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
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("shows both loading and map simultaneously", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByText("Loading")).toBeTruthy();
});

jest.mock("../../src/components/LocationScreen/DirectionPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="direction-panel">
        <Text testID="dp-visible">{String(props.visible)}</Text>
        <Text testID="dp-show-steps">{String(props.showSteps)}</Text>
      </View>
    ),
  };
});

jest.mock("../../src/components/LocationScreen/SearchPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="search-panel">
        <Text testID="sp-visible">{String(props.visible)}</Text>
        <Pressable
          testID="sp-select-building"
          onPress={() =>
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            props.onSelectBuilding(require("../fixtures").hallBuilding)
          }
        />
        <Pressable
          testID="sp-search"
          onPress={() => props.onSearch("Hall", "building", null)}
        />
        <Pressable testID="sp-close" onPress={props.onClose} />
      </View>
    ),
  };
});

jest.mock("../../src/components/LocationScreen/MapControls", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="map-controls">
        <Text testID="mc-panel">{props.panel}</Text>
        <Text testID="mc-has-location">{String(props.hasLocation)}</Text>
        <Pressable testID="mc-open-search" onPress={props.onOpenSearch} />
        <Pressable testID="mc-close-search" onPress={props.onCloseSearch} />
        <Pressable testID="mc-recenter" onPress={props.onRecenter} />
        <Pressable
          testID="mc-return-directions"
          onPress={props.onReturnToDirections}
        />
      </View>
    ),
  };
});

jest.mock("../../src/components/LocationScreen/PoiMarker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="poi-marker">
        <Text>{props.poi?.name}</Text>
        <Text testID="poi-marker-directions-open">
          {String(!!props.isDirectionsOpen)}
        </Text>
        <Pressable
          testID="poi-marker-direction-press"
          onPress={props.onDirectionPress}
        />
      </View>
    ),
  };
});

jest.mock("../../src/components/LocationScreen/PoiResultsPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text, Pressable } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => (
      <View testID="poi-results-panel">
        <Text testID="poi-results-count">{props.results?.length}</Text>
        <Pressable
          testID="poi-select-btn"
          onPress={() => props.onSelectPoi?.(props.results?.[0])}
        />
        <Pressable
          testID="poi-direction-btn"
          onPress={() => props.onDirectionPress?.(props.results?.[0])}
        />
        <Pressable testID="poi-back-btn" onPress={props.onBack} />
      </View>
    ),
  };
});

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  const MockMapView = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      animateToRegion: mockMapAnimateToRegion,
    }));
    return (
      <View testID="map-view" {...props}>
        {props.children}
      </View>
    );
  });
  MockMapView.displayName = "MockMapView";
  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_GOOGLE: "google",
    PROVIDER_DEFAULT: null,
  };
});

jest.mock("../../src/constants", () => ({
  MAP_CONFIG: {
    defaultCampusRegion: {
      latitude: 45.4973,
      longitude: -73.5789,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
  },
}));

jest.mock("../../src/styles/GoogleMaps", () => ({
  __esModule: true,
  default: { container: {}, map: {} },
}));

// ── Tests ──

describe("GoogleMaps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMapUIState = { ...defaultMapUIState };

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
  });

  // ── Renders child components ──

  it("renders all core child components", () => {
    render(<GoogleMaps />);
    expect(screen.getByTestId("map-view")).toBeTruthy();
    expect(screen.getByTestId("building-layer")).toBeTruthy();
    expect(screen.getByTestId("route-polyline")).toBeTruthy();
    expect(screen.getByTestId("map-overlays")).toBeTruthy();
    expect(screen.getByTestId("direction-panel")).toBeTruthy();
    expect(screen.getByTestId("search-panel")).toBeTruthy();
    expect(screen.getByTestId("map-controls")).toBeTruthy();
  });

  it("renders UserLocationMarker when location exists", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: { coords: { latitude: 45.4973, longitude: -73.5789 } },
      loading: false,
      error: null,
    });
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

  // ── MapControls wiring ──

  it("passes current panel to MapControls", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "directions" };
    render(<GoogleMaps />);
    expect(screen.getByTestId("mc-panel").children[0]).toBe("directions");
  });

  it("passes hasLocation to MapControls", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: { coords: { latitude: 45.4973, longitude: -73.5789 } },
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByTestId("mc-has-location").children[0]).toBe("true");
  });

  it("passes hasLocation=false when no location", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByTestId("mc-has-location").children[0]).toBe("false");
  });

  // ── MapControls callbacks dispatch correctly ──

  it("dispatches OPEN_SEARCH when onOpenSearch is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("mc-open-search"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "OPEN_SEARCH" });
  });

  it("dispatches CLOSE_PANEL when onCloseSearch is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("mc-close-search"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_PANEL" });
  });

  it("dispatches RETURN_TO_DIRECTIONS when onReturnToDirections is called", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("mc-return-directions"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "RETURN_TO_DIRECTIONS",
    });
  });

  it("calls handleRecenter when recenter is pressed", () => {
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("mc-recenter"));
    expect(mockHandleRecenter).toHaveBeenCalledTimes(1);
  });

  it("passes onRecenter prop through to handleRecenter", () => {
    const onRecenter = jest.fn();
    render(<GoogleMaps onRecenter={onRecenter} />);
    fireEvent.press(screen.getByTestId("mc-recenter"));
    expect(mockHandleRecenter).toHaveBeenCalledWith(onRecenter);
  });

  // ── Building selection wiring ──

  it("calls animateToBuilding and selectBuilding when SearchPanel selects", () => {
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
    expect(mockHandleSearch).toHaveBeenCalledWith("Hall", "building", null);
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

  // ── Loading / error overlays ──

  it("passes loading state to MapOverlays", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: true,
      error: null,
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Loading")).toBeTruthy();
  });

  it("passes error to MapOverlays when not loading", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: false,
      error: "Failed to load buildings",
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Failed to load buildings")).toBeTruthy();
  });

  it("does not pass error to MapOverlays when loading", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: true,
      error: "Failed to load buildings",
    });
    render(<GoogleMaps />);
    expect(screen.getByText("Loading")).toBeTruthy();
    // Error should be suppressed while loading
    expect(screen.queryByText("Failed to load buildings")).toBeNull();
  });

  it("passes location error to MapOverlays", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: false,
      error: "GPS unavailable",
    });
    render(<GoogleMaps />);
    expect(screen.getByText("GPS unavailable")).toBeTruthy();
  });

  // ── SearchPanel in directions mode ──

  it("dispatches SET_START_BUILDING when selecting from search in directions origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "directions",
    };
    // The mock SearchPanel calls onSelectBuilding with hallBuilding
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-select-building"));
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "SET_START_BUILDING",
      building: hallBuilding,
    });
  });

  // ── POI Results Panel ──

  const mockTestPoi = {
    name: "Test Cafe",
    category: "cafe" as const,
    campus: "SGW",
    address: "123 Test St",
    latitude: 45.496,
    longitude: -73.5795,
    description: "Test cafe",
  };

  it("renders PoiResultsPanel when panel is poi-results", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "poi-results",
      poiResults: [mockTestPoi],
    };
    render(<GoogleMaps />);
    expect(screen.getByTestId("poi-results-panel")).toBeTruthy();
    expect(screen.getByTestId("poi-results-count").children[0]).toBe("1");
  });

  it("does not render PoiResultsPanel when panel is not poi-results", () => {
    mockMapUIState = { ...defaultMapUIState, panel: "none" };
    render(<GoogleMaps />);
    expect(screen.queryByTestId("poi-results-panel")).toBeNull();
  });

  it("calls selectPoi and animateToRegion when onSelectPoi is triggered", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "poi-results",
      poiResults: [mockTestPoi],
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("poi-select-btn"));
    expect(mockSelectPoi).toHaveBeenCalledWith(mockTestPoi);
    expect(mockMapAnimateToRegion).toHaveBeenCalledWith(
      {
        latitude: mockTestPoi.latitude,
        longitude: mockTestPoi.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500,
    );
  });

  it("calls onPoiDirectionPress — selectPoi, animateToBuilding, openDirections", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "poi-results",
      poiResults: [mockTestPoi],
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("poi-direction-btn"));
    expect(mockSelectPoi).toHaveBeenCalledWith(mockTestPoi);
    expect(mockAnimateToBuilding).toHaveBeenCalled();
    expect(mockOpenDirections).toHaveBeenCalled();
  });

  it("dispatches BACK_TO_SEARCH when PoiResultsPanel back is pressed", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "poi-results",
      poiResults: [mockTestPoi],
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("poi-back-btn"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "BACK_TO_SEARCH" });
  });

  // ── PoiMarker rendering ──

  it("renders PoiMarker when selectedPoi exists", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      selectedPoi: mockTestPoi,
    };
    render(<GoogleMaps />);
    expect(screen.getByTestId("poi-marker")).toBeTruthy();
    expect(screen.getByText("Test Cafe")).toBeTruthy();
  });

  it("does not render PoiMarker when selectedPoi is null", () => {
    mockMapUIState = { ...defaultMapUIState, selectedPoi: null };
    render(<GoogleMaps />);
    expect(screen.queryByTestId("poi-marker")).toBeNull();
  });

  it("passes isDirectionsOpen=true to PoiMarker when panel is directions", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      selectedPoi: mockTestPoi,
      panel: "directions",
    };
    render(<GoogleMaps />);
    expect(screen.getByTestId("poi-marker-directions-open").children[0]).toBe(
      "true",
    );
  });

  it("passes isDirectionsOpen=false to PoiMarker when panel is none", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      selectedPoi: mockTestPoi,
      panel: "none",
    };
    render(<GoogleMaps />);
    expect(screen.getByTestId("poi-marker-directions-open").children[0]).toBe(
      "false",
    );
  });

  it("triggers onPoiDirectionPress from PoiMarker direction callback", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      selectedPoi: mockTestPoi,
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("poi-marker-direction-press"));
    expect(mockSelectPoi).toHaveBeenCalledWith(mockTestPoi);
    expect(mockAnimateToBuilding).toHaveBeenCalled();
    expect(mockOpenDirections).toHaveBeenCalled();
  });

  // ── SearchPanel close behaviour ──

  it("dispatches RETURN_TO_DIRECTIONS when search panel closes in directions origin", () => {
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

  it("dispatches CLOSE_PANEL when search panel closes in default origin", () => {
    mockMapUIState = {
      ...defaultMapUIState,
      panel: "search",
      searchOrigin: "default",
    };
    render(<GoogleMaps />);
    fireEvent.press(screen.getByTestId("sp-close"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "CLOSE_PANEL" });
  });
});
