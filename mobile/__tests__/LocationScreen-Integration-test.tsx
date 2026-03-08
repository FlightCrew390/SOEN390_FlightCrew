import React from "react";
import { act, render, screen, userEvent } from "@testing-library/react-native";

import { CAMPUSES } from "../src/constants/campuses";
import LocationScreen from "../src/screens/LocationScreen";
import { Building, StructureType } from "../src/types/Building";

/* ----------------------------- mocks ----------------------------- */

jest.mock("@expo/vector-icons/Entypo", () => () => null);
jest.mock("@expo/vector-icons/Ionicons", () => () => null);

jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  __esModule: true,
  default: {
    OS: "ios",
    select: (obj: any) => obj.ios,
  },
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({ setParams: jest.fn(), navigate: jest.fn() }),
  useRoute: () => ({ params: {} }),
  NavigationContainer: ({ children }: any) => children,
}));

function LocationScreenWithNav() {
  return <LocationScreen />;
}
const mockAnimateToRegion = jest.fn();
const mockSetMapBoundaries = jest.fn();

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const { forwardRef, useImperativeHandle } = React;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");

  const MockMapView = forwardRef((props: JSX.IntrinsicAttributes, ref: any) => {
    MockMapView.displayName = "MockMapView";
    useImperativeHandle(ref, () => ({
      animateToRegion: mockAnimateToRegion,
      setMapBoundaries: mockSetMapBoundaries,
    }));

    return <View testID="map-view" {...props} />;
  });

  return {
    __esModule: true,
    default: MockMapView,
    PROVIDER_DEFAULT: "default",
    PROVIDER_GOOGLE: "google",
    Marker: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock("../src/components/LocationScreen/BuildingMarker", () => ({
  __esModule: true,
  default: () => <></>,
}));

const mockUseBuildingData = jest.fn();
jest.mock("../src/hooks/useBuildingData", () => ({
  useBuildingData: () => mockUseBuildingData(),
}));

const mockUseCurrentLocation = jest.fn();
jest.mock("../src/hooks/useCurrentLocation", () => ({
  useCurrentLocation: () => mockUseCurrentLocation(),
}));

jest.useFakeTimers();

/* ----------------------------- data ----------------------------- */

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
    campus: "LOY",
    buildingCode: "SP",
    buildingName: "Science Pavilion",
    buildingLongName: "Science Pavilion",
    address: "7141 Sherbrooke St. W.",
    latitude: 45.4582,
    longitude: -73.6405,
    accessibilityInfo:
      "Wheelchair accessible entrance at 7141 Sherbrooke St. W.",
  },
];

/* ----------------------------- setup ----------------------------- */

beforeEach(() => {
  jest.clearAllMocks();
  mockUseBuildingData.mockReturnValue({
    buildings: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  });
  mockUseCurrentLocation.mockReturnValue({
    location: null,
    loading: false,
    error: null,
  });
});

/* ----------------------------- tests ----------------------------- */

test("renders LocationScreen base UI", () => {
  render(<LocationScreenWithNav />);

  expect(screen.getByTestId("location-screen")).toBeTruthy();
  expect(screen.getByText("Select a Campus")).toBeTruthy();
  expect(screen.getByText("SGW Campus")).toBeTruthy();
  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("campus navigation updates UI and animates map correctly", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });

  render(<LocationScreenWithNav />);

  const left = screen.getByRole("button", { name: "Previous campus" });
  const right = screen.getByRole("button", { name: "Next campus" });

  // Default campus is SGW (no location → defaults to SGW)
  expect(screen.getByText("SGW Campus")).toBeTruthy();
  expect(left.props.accessibilityState?.disabled).toBe(false);
  expect(right.props.accessibilityState?.disabled).toBe(true);

  // Navigate left to Loyola
  await user.press(left);
  act(() => jest.runAllTimers());

  expect(screen.getByText("Loyola Campus")).toBeTruthy();
  expect(mockAnimateToRegion).toHaveBeenCalledWith(
    {
      latitude: CAMPUSES.LOYOLA.location.latitude,
      longitude: CAMPUSES.LOYOLA.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    1000,
  );

  // Navigate right back to SGW
  await user.press(right);
  act(() => jest.runAllTimers());

  expect(screen.getByText("SGW Campus")).toBeTruthy();
  expect(mockAnimateToRegion).toHaveBeenCalledTimes(2);
});

test("renders buildings when data is loaded", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });

  render(<LocationScreenWithNav />);

  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("renders loading, error, and success states", () => {
  const { rerender } = render(<LocationScreenWithNav />);

  mockUseBuildingData.mockReturnValueOnce({
    buildings: [],
    loading: true,
    error: null,
    refetch: jest.fn(),
  });

  rerender(<LocationScreenWithNav />);

  expect(screen.getByText(/loading/i)).toBeTruthy();

  mockUseBuildingData.mockReturnValueOnce({
    buildings: [],
    loading: false,
    error: "Failed to fetch buildings",
    refetch: jest.fn(),
  });

  rerender(<LocationScreenWithNav />);

  expect(screen.getByText(/failed/i)).toBeTruthy();

  mockUseBuildingData.mockReturnValueOnce({
    buildings: mockBuildings,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });

  rerender(<LocationScreenWithNav />);

  expect(screen.getByTestId("map-view")).toBeTruthy();
});
