import { render, screen } from "@testing-library/react-native";
import React from "react";

import GoogleMaps from "../../src/components/LocationScreen/GoogleMaps";
import { Building } from "../../src/types/Building";

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

jest.mock("react-native-maps", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      capturedOnMapReady = props.onMapReady;
      capturedOnRegionChangeComplete = props.onRegionChangeComplete;
      React.useImperativeHandle(ref, () => ({
        animateToRegion: mockAnimateToRegion,
        setMapBoundaries: mockSetMapBoundaries,
      }));
      return React.createElement("MapView", props, props.children);
    }),
    PROVIDER_DEFAULT: "default",
    PROVIDER_GOOGLE: "google",
  };
});

// Mock BuildingMarker
jest.mock("../../src/components/LocationScreen/BuildingMarker", () => ({
  __esModule: true,
  default: "BuildingMarker",
}));

// Mock UserLocationMarker
jest.mock("../../src/components/LocationScreen/UserLocationMarker", () => ({
  __esModule: true,
  default: "UserLocationMarker",
}));

// Mock useBuildingData hook
const mockUseBuildingData = jest.fn();
jest.mock("../../src/hooks/useBuildingData", () => ({
  useBuildingData: () => mockUseBuildingData(),
}));

// Mock useCurrentLocation hook so tests aren't blocked by location loading
const mockUseCurrentLocation = jest.fn();
jest.mock("../../src/hooks/useCurrentLocation", () => ({
  useCurrentLocation: () => mockUseCurrentLocation(),
}));



const mockBuildings: Building[] = [
  {
    campus: "SGW",
    buildingCode: "H",
    buildingName: "Hall Building",
    buildingLongName: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd. W.",
    latitude: 45.4973,
    longitude: -73.5789,
  },
  {
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
    screen.getByRole("button", { name: "Recenter map on my location" })
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
        latitude: 50.0, // Way above northEast boundary
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
        latitude: 40.0, // Way below southWest boundary
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
        longitude: -70.0, // Way above northEast boundary (less negative)
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
        longitude: -80.0, // Way below southWest boundary (more negative)
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
      screen.queryByRole("button", { name: "Recenter map on my location" })
    ).toBeNull();
    expect(mockOnRecenter).not.toHaveBeenCalled();
  });

  test("handleRecenter calls onRecenter when recenter button pressed", () => {
    const mockOnRecenter = jest.fn();
    const { fireEvent } = require("@testing-library/react-native");

    render(<GoogleMaps onRecenter={mockOnRecenter} />);

    const recenterButton = screen.getByRole("button", {
      name: "Recenter map on my location",
    });
    fireEvent.press(recenterButton);

    expect(mockOnRecenter).toHaveBeenCalled();
  });
});

