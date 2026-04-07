import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import LocationScreen from "../../src/screens/LocationScreen";

// Mock BuildingDataService
jest.mock("../../src/services/BuildingDataService", () => ({
  BuildingDataService: {
    fetchBuildings: jest.fn(() => Promise.resolve([])),
  },
}));

// Mock useCurrentLocation hook
const mockLocation = {
  coords: {
    latitude: 45.4953,
    longitude: -73.5789,
  },
};

jest.mock("../../src/hooks/useCurrentLocation", () => ({
  useCurrentLocation: jest.fn(() => ({ location: mockLocation })),
}));

// Mock getClosestCampusId
jest.mock("../../src/utils/campusDetection", () => ({
  getClosestCampusId: jest.fn(() => "SGW"),
}));

// Mock child components
jest.mock("../../src/components/LocationScreen/GoogleMaps", () => {
  const { View, TouchableOpacity, Text } = jest.requireActual("react-native");
  return function MockGoogleMaps({ onRecenter }: { onRecenter: () => void }) {
    return (
      <View testID="mock-google-maps">
        <TouchableOpacity testID="recenter-button" onPress={onRecenter}>
          <Text>Recenter</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

jest.mock("../../src/components/LocationScreen/CampusSelection", () => {
  const { View, TouchableOpacity, Text } = jest.requireActual("react-native");
  return function MockCampusSelection({
    onCampusChange,
    activeCampusId,
  }: {
    onCampusChange: (id: string) => void;
    activeCampusId: string;
  }) {
    return (
      <View testID="mock-campus-selection">
        <Text testID="current-campus">{activeCampusId}</Text>
        <TouchableOpacity
          testID="change-campus-button"
          onPress={() => onCampusChange("LOYOLA")}
        >
          <Text>Change Campus</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock InteractionManager
jest.mock("react-native/Libraries/Interaction/InteractionManager", () => ({
  runAfterInteractions: jest.fn((callback) => callback()),
}));

// Mock styles
jest.mock("../../src/styles/Screen", () => ({
  screen: {},
  mapWrapper: {},
}));

describe("LocationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders location screen with child components", () => {
    render(<LocationScreen />);

    expect(screen.getByTestId("location-screen")).toBeTruthy();
    expect(screen.getByTestId("mock-google-maps")).toBeTruthy();
    expect(screen.getByTestId("mock-campus-selection")).toBeTruthy();
  });

  test("passes currentCampusId to CampusSelection", () => {
    render(<LocationScreen />);

    expect(screen.getByTestId("current-campus").props.children).toBe("SGW");
  });

  test("recenter updates activeCampusId when onRecenter is called", () => {
    render(<LocationScreen />);

    // Initial campus is SGW (from getClosestCampusId mock)
    expect(screen.getByTestId("current-campus").props.children).toBe("SGW");

    // Press recenter - should reset to closest campus (SGW)
    fireEvent.press(screen.getByTestId("recenter-button"));

    expect(screen.getByTestId("current-campus").props.children).toBe("SGW");
  });

  test("changing campus updates activeCampusId", () => {
    render(<LocationScreen />);

    // Initial campus is SGW
    expect(screen.getByTestId("current-campus").props.children).toBe("SGW");

    // Press change campus button - should change to LOYOLA
    fireEvent.press(screen.getByTestId("change-campus-button"));

    expect(screen.getByTestId("current-campus").props.children).toBe("LOYOLA");
  });
});
