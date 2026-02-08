import { NavigationContainer } from "@react-navigation/native";
import { act, render, screen, userEvent } from "@testing-library/react-native";

import { JSX } from "react";
import { CAMPUSES } from "../src/constants/campuses";
import LocationScreen from "../src/screens/LocationScreen";
import { Building } from "../src/types/Building";

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
    campus: "SGW",
    buildingCode: "H",
    buildingName: "Hall Building",
    buildingLongName: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd. W.",
    latitude: 45.4973,
    longitude: -73.5789,
  },
  {
    campus: "LOY",
    buildingCode: "SP",
    buildingName: "Science Pavilion",
    buildingLongName: "Science Pavilion",
    address: "7141 Sherbrooke St. W.",
    latitude: 45.4582,
    longitude: -73.6405,
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
  render(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  expect(screen.getByTestId("location-screen")).toBeTruthy();
  expect(screen.getByText("Select a Campus")).toBeTruthy();
  expect(screen.getByText("Loyola Campus")).toBeTruthy();
  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("campus navigation updates UI and animates map correctly", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });

  render(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  const left = screen.getByRole("button", { name: "Previous campus" });
  const right = screen.getByRole("button", { name: "Next campus" });

  expect(screen.getByText("Loyola Campus")).toBeTruthy();
  expect(left.props.accessibilityState?.disabled).toBe(true);
  expect(right.props.accessibilityState?.disabled).toBe(false);

  await user.press(right);
  act(() => jest.runAllTimers());

  expect(screen.getByText(" SGW Campus")).toBeTruthy();
  expect(mockAnimateToRegion).toHaveBeenCalledWith(
    {
      latitude: CAMPUSES.SGW.location.latitude,
      longitude: CAMPUSES.SGW.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    },
    1000,
  );

  await user.press(left);
  act(() => jest.runAllTimers());

  expect(screen.getByText("Loyola Campus")).toBeTruthy();
  expect(mockAnimateToRegion).toHaveBeenCalledTimes(2);
});

test("renders buildings when data is loaded", () => {
  mockUseBuildingData.mockReturnValue({
    buildings: mockBuildings,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });

  render(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  expect(screen.getByTestId("map-view")).toBeTruthy();
});

test("renders loading, error, and success states", () => {
  const { rerender } = render(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  mockUseBuildingData.mockReturnValueOnce({
    buildings: [],
    loading: true,
    error: null,
    refetch: jest.fn(),
  });

  rerender(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  expect(screen.getByText(/loading/i)).toBeTruthy();

  mockUseBuildingData.mockReturnValueOnce({
    buildings: [],
    loading: false,
    error: "Failed to fetch buildings",
    refetch: jest.fn(),
  });

  rerender(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  expect(screen.getByText(/failed/i)).toBeTruthy();

  mockUseBuildingData.mockReturnValueOnce({
    buildings: mockBuildings,
    loading: false,
    error: null,
    refetch: jest.fn(),
  });

  rerender(
    <NavigationContainer>
      <LocationScreen />
    </NavigationContainer>,
  );

  expect(screen.getByTestId("map-view")).toBeTruthy();
});
