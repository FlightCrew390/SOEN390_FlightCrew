import { expect, test } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import React from "react";

import GoogleMaps from "../src/components/LocationScreen/GoogleMaps";
import { Building } from "../src/types/Building";

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

// Mock react-native-maps
jest.mock("react-native-maps", () => ({
  __esModule: true,
  default: "MapView",
  PROVIDER_DEFAULT: "default",
  PROVIDER_GOOGLE: "google",
}));

// Mock BuildingMarker
jest.mock("../src/components/LocationScreen/BuildingMarker", () => ({
  __esModule: true,
  default: "BuildingMarker",
}));

// Mock useBuildingData hook
const mockUseBuildingData = jest.fn();
jest.mock("../src/hooks/useBuildingData", () => ({
  useBuildingData: () => mockUseBuildingData(),
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
  mockUseBuildingData.mockReturnValue({
    buildings: [],
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

  expect(screen.getByText("Error: Failed to fetch buildings")).toBeTruthy();
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
