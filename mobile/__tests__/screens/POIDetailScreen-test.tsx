import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import POIDetailScreen from "../../src/screens/POIDetailScreen";
import { Building } from "../../src/types/Building";

const mockBuilding: Building = {
  campus: "SGW",
  buildingCode: "EV",
  buildingName: "Engineering Building",
  buildingLongName: "EV Building",
  address: "1515 St. Catherine W.",
  latitude: 45.4957,
  longitude: -73.5773,
};

const mockLocation = {
  coords: {
    latitude: 45.4973,
    longitude: -73.5789,
    altitude: 0,
    accuracy: 10,
    heading: 0,
    speed: 0,
  },
  timestamp: Date.now(),
};

const mockBuildings: Building[] = [
  {
    ...mockBuilding,
    buildingCode: "H",
    buildingName: "Hall Building",
    latitude: 45.4973,
    longitude: -73.5789,
  },
  mockBuilding,
];

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ goBack: jest.fn() }),
  useRoute: () => ({
    params: { building: mockBuilding },
  }),
}));

jest.mock("../../src/hooks/useCurrentLocation", () => ({
  useCurrentLocation: jest.fn(() => ({ location: mockLocation })),
}));

jest.mock("../../src/hooks/useBuildingData", () => ({
  useBuildingData: jest.fn(() => ({
    buildings: mockBuildings,
    loading: false,
    error: null,
  })),
}));

jest.mock("react-native-maps", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: object) => <View testID="map-view" {...props} />,
    Marker: () => null,
    Polyline: () => null,
  };
});

jest.mock("../../src/services/DirectionsService", () => ({
  fetchDirections: jest.fn(() =>
    Promise.resolve({
      encodedPolyline: "encoded",
      steps: [{ instruction: "Head north" }],
    }),
  ),
  travelModeFromShort: jest.fn((x: string) => x),
}));

jest.mock("../../src/utils/decodePolyline", () => ({
  decodePolyline: jest.fn(() => [
    { latitude: 45.4957, longitude: -73.5773 },
    { latitude: 45.496, longitude: -73.578 },
  ]),
}));

describe("POIDetailScreen", () => {
  test("renders screen with destination building info", () => {
    render(<POIDetailScreen />);
    expect(screen.getByText("Engineering Building")).toBeTruthy();
    expect(screen.getByText(/1515 St. Catherine/)).toBeTruthy();
  });

  test("shows Use Current Location when location is available", () => {
    render(<POIDetailScreen />);
    expect(screen.getByTestId("use-current-location")).toBeTruthy();
    expect(screen.getByText("Use Current Location")).toBeTruthy();
  });

  test("shows Change starting point button", () => {
    render(<POIDetailScreen />);
    expect(screen.getByTestId("change-starting-point")).toBeTruthy();
    expect(screen.getByText("Change starting point")).toBeTruthy();
  });

  test("shows Starting from section with detected or current label", () => {
    render(<POIDetailScreen />);
    expect(screen.getByText("Starting from")).toBeTruthy();
    const label =
      screen.queryByText("Hall Building") ?? screen.queryByText("Your location");
    expect(label).toBeTruthy();
  });

  test("opening Change starting point shows modal with building list", () => {
    render(<POIDetailScreen />);
    fireEvent.press(screen.getByTestId("change-starting-point"));
    expect(screen.getByText("Starting point")).toBeTruthy();
    expect(screen.getByTestId("origin-search-input")).toBeTruthy();
    expect(screen.getByTestId("origin-building-H")).toBeTruthy();
    expect(screen.getByTestId("origin-building-EV")).toBeTruthy();
  });

  test("selecting a building in modal updates starting point and closes modal", () => {
    render(<POIDetailScreen />);
    fireEvent.press(screen.getByTestId("change-starting-point"));
    fireEvent.press(screen.getByTestId("origin-building-H"));
    expect(screen.queryByTestId("origin-search-input")).toBeNull();
    expect(screen.getByText("Hall Building")).toBeTruthy();
  });
});
