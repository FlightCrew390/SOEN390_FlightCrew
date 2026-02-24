import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import LocationScreen from "../../src/screens/LocationScreen";

const Stack = createNativeStackNavigator();

function EmptyScreen() {
  return null;
}

function renderWithNavigation() {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Location" component={LocationScreen} />
        <Stack.Screen name="POIDetail" component={EmptyScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
  );
}

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
  const { View, TouchableOpacity, Text } = require("react-native");
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
  const { View, TouchableOpacity, Text } = require("react-native");
  return function MockCampusSelection({
    onCampusChange,
    currentCampusId,
    recenterTrigger,
  }: {
    onCampusChange: (id: string) => void;
    currentCampusId: string | null;
    recenterTrigger: number;
  }) {
    return (
      <View testID="mock-campus-selection">
        <Text testID="current-campus">{currentCampusId}</Text>
        <Text testID="recenter-trigger">{recenterTrigger}</Text>
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
  });

  test("renders location screen with child components", () => {
    const { getByTestId } = renderWithNavigation();

    expect(getByTestId("location-screen")).toBeTruthy();
    expect(getByTestId("mock-google-maps")).toBeTruthy();
    expect(getByTestId("mock-campus-selection")).toBeTruthy();
  });

  test("passes currentCampusId to CampusSelection", () => {
    const { getByTestId } = renderWithNavigation();

    expect(getByTestId("current-campus").props.children).toBe("SGW");
  });

  test("recenter trigger increments when onRecenter is called", () => {
    const { getByTestId } = renderWithNavigation();

    expect(getByTestId("recenter-trigger").props.children).toBe(0);

    fireEvent.press(getByTestId("recenter-button"));

    expect(getByTestId("recenter-trigger").props.children).toBe(1);
  });
});
