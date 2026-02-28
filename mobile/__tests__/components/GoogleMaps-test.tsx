import { act, render, screen } from "@testing-library/react-native";
import React from "react";

import GoogleMaps from "../../src/components/LocationScreen/GoogleMaps";
import { Building, StructureType } from "../../src/types/Building";

// Mock Platform
jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  __esModule: true,
  default: {
    OS: "ios",
    select: jest.fn((obj) => obj.ios),
  },
  OS: "ios",
  select: jest.fn((obj) => obj.ios),
}));

// Mock react-native-maps with functional MapView that captures callbacks
const mockAnimateToRegion = jest.fn();
const mockSetMapBoundaries = jest.fn();
let capturedOnMapReady: (() => void) | null = null;
let capturedOnRegionChangeComplete: ((region: any) => void) | null = null;
let capturedOnPress: (() => void) | null = null;

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const MapViewMock = React.forwardRef((props: any, ref: any) => {
    capturedOnMapReady = props.onMapReady;
    capturedOnRegionChangeComplete = props.onRegionChangeComplete;
    capturedOnPress = props.onPress;
    React.useImperativeHandle(ref, () => ({
      animateToRegion: mockAnimateToRegion,
      setMapBoundaries: mockSetMapBoundaries,
    }));
    return React.createElement("MapView", props, props.children);
  });
  MapViewMock.displayName = "MapView";
  return {
    __esModule: true,
    default: MapViewMock,
    PROVIDER_DEFAULT: "default",
    PROVIDER_GOOGLE: "google",
  };
});

// Mock BuildingMarker – capture props so tests can invoke callbacks
let capturedLastBuildingMarkerProps: any = null;
jest.mock("../../src/components/LocationScreen/BuildingMarker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const BuildingMarkerMock = (props: any) => {
    capturedLastBuildingMarkerProps = props;
    return React.createElement("BuildingMarker", {
      testID: props.building?.buildingCode,
    });
  };
  BuildingMarkerMock.displayName = "BuildingMarker";
  return { __esModule: true, default: BuildingMarkerMock };
});

// Mock BuildingPolygon
jest.mock("../../src/components/LocationScreen/BuildingPolygon", () => ({
  __esModule: true,
  default: "BuildingPolygon",
}));

// Mock UserLocationMarker
jest.mock("../../src/components/LocationScreen/UserLocationMarker", () => ({
  __esModule: true,
  default: "UserLocationMarker",
}));

// Mock DirectionPanel – capture props for assertion
let capturedDirectionProps: any = null;
jest.mock("../../src/components/LocationScreen/DirectionPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const DirectionPanelMock = (props: any) => {
    capturedDirectionProps = props;
    return React.createElement("DirectionPanel", props);
  };
  DirectionPanelMock.displayName = "DirectionPanel";
  return { __esModule: true, default: DirectionPanelMock };
});

// Mock SearchPanel
let capturedSearchProps: any = null;
jest.mock("../../src/components/LocationScreen/SearchPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const SearchPanelMock = (props: any) => {
    capturedSearchProps = props;
    return React.createElement("SearchPanel", props);
  };
  SearchPanelMock.displayName = "SearchPanel";
  return {
    __esModule: true,
    default: SearchPanelMock,
  };
});

// Mock BuildingContext
const mockUseBuildingData = jest.fn();
jest.mock("../../src/contexts/BuildingContext", () => ({
  useBuildings: () => mockUseBuildingData(),
}));

// Mock LocationContext so tests aren't blocked by location loading
const mockUseCurrentLocation = jest.fn();
jest.mock("../../src/contexts/LocationContext", () => ({
  useLocation: () => mockUseCurrentLocation(),
}));

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

beforeEach(() => {
  jest.clearAllMocks();
  capturedOnMapReady = null;
  capturedOnRegionChangeComplete = null;
  capturedOnPress = null;
  capturedSearchProps = null;
  capturedDirectionProps = null;
  capturedLastBuildingMarkerProps = null;
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

  const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("MapView");
});

test("renders loading indicator when loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByText("Loading buildings...")).toBeTruthy();
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

  const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);
  const tree = JSON.stringify(toJSON());

  expect(tree).toContain("BuildingMarker");
  expect(tree).toContain("MapView");
});

test("does not render loading overlay when not loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.queryByText("Loading buildings...")).toBeNull();
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

  const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);
  const tree = JSON.stringify(toJSON());

  expect(tree).toContain("MapView");
});

test("shows both loading and map simultaneously", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByText("Loading buildings...")).toBeTruthy();
});

test("shows location loading text when location is loading", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
  });
  mockUseCurrentLocation.mockReturnValue({
    location: null,
    loading: true,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(screen.getByText("Getting your location...")).toBeTruthy();
});

test("renders UserLocationMarker when location available", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
  });
  mockUseCurrentLocation.mockReturnValue({
    location: { coords: { latitude: 45.4973, longitude: -73.5789 } },
    loading: false,
    error: null,
  });

  const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);
  const tree = JSON.stringify(toJSON());

  expect(tree).toContain("UserLocationMarker");
});

test("renders recenter button when location available", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
  });
  mockUseCurrentLocation.mockReturnValue({
    location: { coords: { latitude: 45.4973, longitude: -73.5789 } },
    loading: false,
    error: null,
  });

  render(<GoogleMaps mapRef={React.createRef()} />);

  expect(
    screen.getByRole("button", { name: "Recenter map on my location" }),
  ).toBeTruthy();
});

test("finds current building when location and buildings available", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
  });
  mockUseCurrentLocation.mockReturnValue({
    location: { coords: { latitude: 45.4973, longitude: -73.5789 } },
    loading: false,
    error: null,
  });

  const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);

  expect(toJSON()).toBeTruthy();
});

describe("map callbacks", () => {
  beforeEach(() => {
    mockUseBuildingData.mockReturnValue({
      buildings: [],
      loading: false,
      error: null,
    });
    mockUseCurrentLocation.mockReturnValue({
      location: { coords: { latitude: 45.4973, longitude: -73.5789 } },
      loading: false,
      error: null,
    });
  });

  test("handleMapReady sets boundaries on Android", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Platform = require("react-native/Libraries/Utilities/Platform");
    Platform.default.OS = "android";
    Platform.OS = "android";

    render(<GoogleMaps />);

    if (capturedOnMapReady) {
      capturedOnMapReady();
    }

    expect(mockSetMapBoundaries).toHaveBeenCalled();

    // Reset Platform
    Platform.default.OS = "ios";
    Platform.OS = "ios";
  });

  test("handleMapReady does not set boundaries on iOS", () => {
    render(<GoogleMaps />);

    if (capturedOnMapReady) {
      capturedOnMapReady();
    }

    expect(mockSetMapBoundaries).not.toHaveBeenCalled();
  });

  test("handleRegionChangeComplete corrects region when latitude too high", () => {
    render(<GoogleMaps />);

    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 50, // Way above northEast boundary
        longitude: -73.6,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    expect(mockAnimateToRegion).toHaveBeenCalled();
  });

  test("handleRegionChangeComplete corrects region when latitude too low", () => {
    render(<GoogleMaps />);

    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 40, // Way below southWest boundary
        longitude: -73.6,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    expect(mockAnimateToRegion).toHaveBeenCalled();
  });

  test("handleRegionChangeComplete corrects region when longitude too high", () => {
    render(<GoogleMaps />);

    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 45.48,
        longitude: -70, // Way above northEast boundary (less negative)
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    expect(mockAnimateToRegion).toHaveBeenCalled();
  });

  test("handleRegionChangeComplete corrects region when longitude too low", () => {
    render(<GoogleMaps />);

    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 45.48,
        longitude: -80, // Way below southWest boundary (more negative)
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    expect(mockAnimateToRegion).toHaveBeenCalled();
  });

  test("handleRegionChangeComplete does not correct valid region", () => {
    render(<GoogleMaps />);

    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 45.48, // Within bounds
        longitude: -73.6, // Within bounds
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }

    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });

  test("handleRecenter does nothing when location is null", () => {
    mockUseCurrentLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
    });
    const mockOnRecenter = jest.fn();

    render(<GoogleMaps onRecenter={mockOnRecenter} />);

    // Recenter button should not be rendered when location is null
    expect(
      screen.queryByRole("button", { name: "Recenter map on my location" }),
    ).toBeNull();
    expect(mockOnRecenter).not.toHaveBeenCalled();
  });

  test("handleRecenter calls onRecenter when recenter button pressed", () => {
    const mockOnRecenter = jest.fn();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fireEvent } = require("@testing-library/react-native");

    render(<GoogleMaps onRecenter={mockOnRecenter} />);

    const recenterButton = screen.getByRole("button", {
      name: "Recenter map on my location",
    });
    fireEvent.press(recenterButton);

    expect(mockOnRecenter).toHaveBeenCalled();
  });

  test("renders building polygons for each building", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain("BuildingPolygon");
  });

  test("renders both polygon and marker for each building", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    const { toJSON } = render(<GoogleMaps mapRef={React.createRef()} />);
    const tree = JSON.stringify(toJSON());

    expect(tree).toContain("BuildingPolygon");
    expect(tree).toContain("BuildingMarker");
  });

  test("renders search button", () => {
    render(<GoogleMaps mapRef={React.createRef()} />);

    expect(
      screen.getByRole("button", { name: "Search campus buildings" }),
    ).toBeTruthy();
  });

  test("direction panel is initially not visible", () => {
    render(<GoogleMaps mapRef={React.createRef()} />);

    expect(capturedDirectionProps).not.toBeNull();
    expect(capturedDirectionProps.visible).toBe(false);
    expect(capturedDirectionProps.building).toBeNull();
  });

  test("onDirectionPress opens direction panel for the building", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Trigger direction press via the last captured BuildingMarker
    expect(capturedLastBuildingMarkerProps).not.toBeNull();
    act(() => {
      capturedLastBuildingMarkerProps.onDirectionPress();
    });

    expect(capturedDirectionProps.visible).toBe(true);
    expect(capturedDirectionProps.building).not.toBeNull();
  });

  test("search button is hidden while direction panel is open", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    act(() => {
      capturedLastBuildingMarkerProps.onDirectionPress();
    });

    expect(
      screen.queryByRole("button", { name: "Search campus buildings" }),
    ).toBeNull();
  });

  test("closing direction panel hides it", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    act(() => {
      capturedLastBuildingMarkerProps.onDirectionPress();
    });
    expect(capturedDirectionProps.visible).toBe(true);

    act(() => {
      capturedDirectionProps.onClose();
    });
    expect(capturedDirectionProps.visible).toBe(false);
  });

  test("pressing search button toggles search panel", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fireEvent } = require("@testing-library/react-native");

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Initially closed
    expect(capturedSearchProps.visible).toBe(false);

    // Open
    const btn = screen.getByRole("button", { name: "Search campus buildings" });
    fireEvent.press(btn);
    expect(capturedSearchProps.visible).toBe(true);
  });

  test("handleSearch animates to matching building", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Call onSearch captured from SearchPanel mock
    capturedSearchProps.onSearch("Hall", "building");

    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.4973,
        longitude: -73.5789,
      }),
      800,
    );
  });

  test("handleSearch does nothing for empty query", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    capturedSearchProps.onSearch("", "building");

    expect(mockAnimateToRegion).not.toHaveBeenCalled();
  });

  test("handleSelectBuilding animates to building directly", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Call onSelectBuilding captured from SearchPanel mock
    capturedSearchProps.onSelectBuilding(mockBuildings[0]);

    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitude: 45.4973,
        longitude: -73.5789,
      }),
      800,
    );
  });

  test("setTimeout in region correction resets isCorrectingRef", () => {
    jest.useFakeTimers();

    render(<GoogleMaps />);

    // Trigger a correction
    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 50,
        longitude: -73.6,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);

    // Advance timers to run the setTimeout callback (400ms)
    jest.advanceTimersByTime(400);

    // Now a second correction should also work because isCorrectingRef was reset
    mockAnimateToRegion.mockClear();
    if (capturedOnRegionChangeComplete) {
      capturedOnRegionChangeComplete({
        latitude: 50,
        longitude: -73.6,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
    expect(mockAnimateToRegion).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test("map onPress dispatches TAP_MAP to deselect building", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Select a building first
    act(() => {
      capturedLastBuildingMarkerProps.onSelect();
    });
    expect(capturedDirectionProps.building).not.toBeNull();

    // Tap map to deselect
    act(() => {
      if (capturedOnPress) capturedOnPress();
    });
    expect(capturedDirectionProps.building).toBeNull();
  });

  test("BuildingMarker onSelect triggers handleSelectBuilding", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    act(() => {
      capturedLastBuildingMarkerProps.onSelect();
    });

    expect(mockAnimateToRegion).toHaveBeenCalledWith(
      expect.objectContaining({
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      }),
      800,
    );
  });

  test("search panel close returns to directions when searchOrigin is directions", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Open directions panel first
    act(() => {
      capturedLastBuildingMarkerProps.onDirectionPress();
    });
    expect(capturedDirectionProps.visible).toBe(true);

    // Open search from directions via direction panel's onOpenSearch
    act(() => {
      capturedDirectionProps.onOpenSearch();
    });
    expect(capturedSearchProps.visible).toBe(true);

    // Close search panel — should return to directions
    act(() => {
      capturedSearchProps.onClose();
    });
    expect(capturedDirectionProps.visible).toBe(true);
  });

  test("search panel onSelectBuilding dispatches SET_START_BUILDING when searchOrigin is directions", () => {
    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Open directions panel
    act(() => {
      capturedLastBuildingMarkerProps.onDirectionPress();
    });

    // Open search from directions
    act(() => {
      capturedDirectionProps.onOpenSearch();
    });

    // Select a building as start point
    act(() => {
      capturedSearchProps.onSelectBuilding(mockBuildings[1]);
    });

    // Should return to directions panel with startBuilding set
    expect(capturedDirectionProps.visible).toBe(true);
    expect(capturedDirectionProps.startBuilding).toEqual(mockBuildings[1]);
  });

  test("search button shows close icon and closes search when pressed while search is open", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fireEvent } = require("@testing-library/react-native");

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Open search
    const searchBtn = screen.getByRole("button", {
      name: "Search campus buildings",
    });
    fireEvent.press(searchBtn);
    expect(capturedSearchProps.visible).toBe(true);

    // Now press the close search button
    const closeBtn = screen.getByRole("button", { name: "Close search" });
    fireEvent.press(closeBtn);
    expect(capturedSearchProps.visible).toBe(false);
  });

  test("search button returns to directions when searchOrigin is directions", () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { fireEvent } = require("@testing-library/react-native");

    mockUseBuildingData.mockReturnValue({
      buildings: mockBuildings,
      loading: false,
      error: null,
    });

    render(<GoogleMaps mapRef={React.createRef()} />);

    // Open directions
    act(() => {
      capturedLastBuildingMarkerProps.onDirectionPress();
    });

    // Open search from directions (via direction panel)
    act(() => {
      capturedDirectionProps.onOpenSearch();
    });
    expect(capturedSearchProps.visible).toBe(true);

    // Press the search/back button — should return to directions
    const backBtn = screen.getByRole("button", { name: "Close search" });
    fireEvent.press(backBtn);
    expect(capturedDirectionProps.visible).toBe(true);
    expect(capturedSearchProps.visible).toBe(false);
  });
});
