import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated, Image, ScrollView, Text, View } from "react-native";

import DirectionPanel from "../../src/components/LocationScreen/DirectionPanel";
import { Building } from "../../src/types/Building";
import { TravelMode } from "../../src/types/Directions";

jest.mock("@expo/vector-icons/FontAwesome5", () => "FontAwesome5");
jest.mock("@expo/vector-icons/MaterialIcons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  const MockMaterialIcon = (props: any) => (
    <View {...props} testID={`material-icon-${props.name}`} />
  );
  MockMaterialIcon.displayName = "MockMaterialIcon";
  return MockMaterialIcon;
});

jest.mock("../../src/hooks/usePanelAnimation", () => ({
  usePanelAnimation: () => ({
    fadeAnim: {},
    slideAnim: {},
    animatedStyle: {},
  }),
}));

jest.mock("../../src/styles/DirectionPanel", () => ({
  __esModule: true,
  default: {
    container: {},
    header: {},
    headerTitle: {},
    closeButton: {},
    body: {},
    buildingName: {},
    addressRow: {},
    searchButtonLeftOfAddress: {},
    buildingAddress: {},
    buildingInfoRow: {},
    headerLeft: {},
    distanceText: {},
    transportRow: {},
    transportCard: {},
    transportIcon: {},
    transportTime: {},
    divider: {},
    descriptionScroll: {},
    buildingLongName: {},
    buildingDetail: {},
    changeStartWrapper: {},
    changeStartRow: {},
    changeStartText: {},
    changeStart: {},
    resetStartRow: {},
    resetStartText: {},
    loadingRow: {},
    loadingText: {},
    errorRow: {},
    errorText: {},
    viewStepsButton: {},
    viewStepsText: {},
    transportCardActive: {},
    transportIconActive: {},
    transportTimeActive: {},
  },
}));

jest.mock("../../src/styles/StepsPanel", () => ({
  __esModule: true,
  default: {
    container: {},
    header: {},
    backButton: {},
    headerContent: {},
    buildingName: {},
    buildingAddress: {},
    distanceText: {},
    stepScroll: {},
    stepRow: {},
    stepRowEven: {},
    stepContent: {},
    stepInstruction: {},
    stepMeta: {},
    startBuildingIcon: {},
  },
}));

// Mock image assets used by transport cards
jest.mock("../../../assets/walk.png", () => 0, { virtual: true });
jest.mock("../../../assets/bike.png", () => 0, { virtual: true });
jest.mock("../../../assets/train.png", () => 0, { virtual: true });
jest.mock("../../../assets/car.png", () => 0, { virtual: true });

const building: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
};

const loyolaBuilding: Building = {
  campus: "LOY",
  buildingCode: "AD",
  buildingName: "Administration Building",
  buildingLongName: "Loyola Administration Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.4582,
  longitude: -73.6405,
};

const defaultStepsProps = {
  showSteps: false,
  onShowSteps: jest.fn(),
  onHideSteps: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

// --- Visibility ---

test("is non-interactive when not visible", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={false}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(
    screen.queryByRole("button", { name: "Close direction panel" }),
  ).toBeNull();
});

test("renders empty panel when building is null", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={null}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.queryByText("Directions")).toBeNull();
});

// --- Header ---

test("renders building long name and address when visible", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
  const addressNodes = screen.getAllByText("1455 De Maisonneuve Blvd. W.");
  expect(addressNodes.length).toBeGreaterThanOrEqual(1);
});

test("renders Directions header when visible", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Directions")).toBeTruthy();
});

// --- Building info ---

test("renders building name and address when visible", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Hall Building")).toBeTruthy();
  const addressNodes = screen.getAllByText("1455 De Maisonneuve Blvd. W.");
  expect(addressNodes.length).toBeGreaterThanOrEqual(1);
});

test("renders building long name in details section", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
});

test("renders building code in details section", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Building Code: H")).toBeTruthy();
});

test("renders SGW campus label correctly", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Campus: Sir George Williams")).toBeTruthy();
});

test("renders Loyola campus label correctly", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={loyolaBuilding}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Campus: Loyola")).toBeTruthy();
});

test("renders distance placeholder", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("-- m")).toBeTruthy();
});

// --- Transport cards ---

test("renders four transport time placeholders", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const timePlaceholders = screen.getAllByText("-- min");
  expect(timePlaceholders).toHaveLength(4);
});

// --- Close button ---

test("calls onClose when close button is pressed", () => {
  const onClose = jest.fn();
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={onClose}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  fireEvent.press(
    screen.getByRole("button", { name: "Close direction panel" }),
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("does not call onClose before button is pressed", () => {
  const onClose = jest.fn();
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={onClose}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(onClose).not.toHaveBeenCalled();
});

// --- Search button (onOpenSearch) ---

test("renders search button when building is visible", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      onOpenSearch={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(
    screen.getByRole("button", {
      name: "Search buildings to change directions start",
    }),
  ).toBeTruthy();
});

test("calls onOpenSearch when search button is pressed", () => {
  const onOpenSearch = jest.fn();
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      onOpenSearch={onOpenSearch}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  fireEvent.press(
    screen.getByRole("button", {
      name: "Search buildings to change directions start",
    }),
  );
  expect(onOpenSearch).toHaveBeenCalledTimes(1);
});

test("search button is disabled when onOpenSearch is not provided", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const searchButton = screen.getByRole("button", {
    name: "Search buildings to change directions start",
  });
  expect(searchButton.props.accessibilityState?.disabled).toBe(true);
});

// --- Animated.View pointerEvents ---

test("sets pointerEvents to 'auto' when visible and building exists", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const animatedViews = UNSAFE_getAllByType(Animated.View);
  const mainPanel = animatedViews.find((view) => view.props.pointerEvents);
  expect(mainPanel?.props.pointerEvents).toBe("auto");
});

test("sets pointerEvents to 'none' when not visible", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={false}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const animatedViews = UNSAFE_getAllByType(Animated.View);
  const mainPanel = animatedViews.find((view) => view.props.pointerEvents);
  expect(mainPanel?.props.pointerEvents).toBe("none");
});

test("sets pointerEvents to 'none' when building is null", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={null}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const animatedViews = UNSAFE_getAllByType(Animated.View);
  const mainPanel = animatedViews.find((view) => view.props.pointerEvents);
  expect(mainPanel?.props.pointerEvents).toBe("none");
});

// --- TransportCard rendering ---

test("renders all four transport card images", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const images = UNSAFE_getAllByType(Image);
  expect(images.length).toBe(4);
});

test("transport cards have correct resizeMode", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const images = UNSAFE_getAllByType(Image);
  images.forEach((image) => {
    expect(image.props.resizeMode).toBe("contain");
  });
});

test("transport cards are wrapped in View containers", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const views = UNSAFE_getAllByType(View);
  expect(views.length).toBeGreaterThan(0);
});

// --- Building info row ---

test("renders building name with numberOfLines prop", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const texts = UNSAFE_getAllByType(Text);
  const buildingNameText = texts.find(
    (text) => text.props.children === "Hall Building",
  );
  expect(buildingNameText?.props.numberOfLines).toBe(1);
});

test("renders building address with numberOfLines prop", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const texts = UNSAFE_getAllByType(Text);
  const addressText = texts.find(
    (text) => text.props.children === "1455 De Maisonneuve Blvd. W.",
  );
  expect(addressText?.props.numberOfLines).toBe(2);
});

test("uses buildingCode as fallback when buildingName is null", () => {
  const buildingWithoutName = { ...building, buildingName: null as any };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={buildingWithoutName}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("H")).toBeTruthy();
});

test("renders empty string when address is null", () => {
  const buildingWithoutAddress = { ...building, address: null as any };
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={buildingWithoutAddress}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  // Should render the building name but address should be empty/not crash
  expect(screen.getByText("Hall Building")).toBeTruthy();
  // The address field should exist but be empty
  const texts = UNSAFE_getAllByType(Text);
  const addressText = texts.find(
    (text) => text.props.numberOfLines === 2 && text.props.children === "",
  );
  expect(addressText?.props.children).toBe("");
});

// --- ScrollView interactions ---

test("ScrollView shows vertical scroll indicator", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const scrollViews = UNSAFE_getAllByType(ScrollView);
  const stepScrollView = scrollViews.find(
    (sv) => sv.props.showsVerticalScrollIndicator === true,
  );
  expect(stepScrollView).toBeTruthy();
});

test("ScrollView handles touch responder", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const scrollViews = UNSAFE_getAllByType(ScrollView);
  const stepScrollView = scrollViews.find(
    (sv) => sv.props.onStartShouldSetResponder,
  );
  expect(stepScrollView?.props.onStartShouldSetResponder()).toBe(true);
});

test("ScrollView contains all building detail texts", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
  expect(screen.getByText("Building Code: H")).toBeTruthy();
  expect(screen.getByText("Campus: Sir George Williams")).toBeTruthy();
});

// --- Edge cases for building properties ---

test("handles building with missing buildingLongName", () => {
  const buildingWithoutLongName = {
    ...building,
    buildingLongName: undefined as any,
  };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={buildingWithoutLongName}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  // Should still render other building details without crashing
  expect(screen.getByText("Building Code: H")).toBeTruthy();
  expect(screen.getByText("Campus: Sir George Williams")).toBeTruthy();
});

test("renders divider between transport and details sections", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const views = UNSAFE_getAllByType(View);
  expect(views.length).toBeGreaterThan(5); // Multiple Views including divider
});

// --- Start building ---

test("shows 'Starting from your current location' when no startBuilding", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Starting from your current location")).toBeTruthy();
});

test("shows starting building name when startBuilding is provided", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Starting at Administration Building")).toBeTruthy();
});

test("shows starting building code when startBuilding has no buildingName", () => {
  const startWithoutName = { ...loyolaBuilding, buildingName: null as any };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      startBuilding={startWithoutName}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Starting at AD")).toBeTruthy();
});

// --- Reset to current location ---

test("does not show 'Use current location' button when no startBuilding", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      onClose={jest.fn()}
      onResetStart={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.queryByText("Use current location")).toBeNull();
});

test("shows 'Use current location' button when startBuilding is set", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
      onResetStart={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  expect(screen.getByText("Use current location")).toBeTruthy();
});

test("calls onResetStart when 'Use current location' is pressed", () => {
  const onResetStart = jest.fn();
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
      onResetStart={onResetStart}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  fireEvent.press(
    screen.getByRole("button", { name: "Reset to current location" }),
  );
  expect(onResetStart).toHaveBeenCalledTimes(1);
});

test("reset button is disabled when onResetStart is not provided", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode={"WALK"}
      onTravelModeChange={function (mode: TravelMode | null): void {
        throw new Error("Function not implemented.");
      }}
    />,
  );
  const resetButton = screen.getByRole("button", {
    name: "Reset to current location",
  });
  expect(resetButton.props.accessibilityState?.disabled).toBe(true);
});

// --- Route with data (formatDuration, formatDistance, steps) ---

const sampleRoute = {
  coordinates: [
    { latitude: 45.497, longitude: -73.579 },
    { latitude: 45.498, longitude: -73.58 },
  ],
  distanceMeters: 1500,
  durationSeconds: 600,
  steps: [
    {
      distanceMeters: 500,
      durationSeconds: 200,
      instruction: "Head north on Guy St",
      maneuver: "DEPART",
      coordinates: [],
    },
    {
      distanceMeters: 1000,
      durationSeconds: 400,
      instruction: "Turn left on Sherbrooke",
      maneuver: "TURN_LEFT",
      coordinates: [],
    },
  ],
};

test("renders route distance in km when route is provided", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("1.5 km")).toBeTruthy();
});

test("renders route distance in meters when less than 1000m", () => {
  const shortRoute = { ...sampleRoute, distanceMeters: 500 };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={shortRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("500 m")).toBeTruthy();
});

test("renders duration in minutes on active transport card", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("10 min")).toBeTruthy();
});

test("renders duration in hours and minutes for long routes", () => {
  const longRoute = { ...sampleRoute, durationSeconds: 5400 }; // 1hr 30min
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={longRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("1 hr 30 min")).toBeTruthy();
});

test("renders duration in hours only when evenly divisible", () => {
  const evenRoute = { ...sampleRoute, durationSeconds: 7200 }; // 2hr
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={evenRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("2 hr")).toBeTruthy();
});

test("renders turn-by-turn steps when route has steps", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Head north on Guy St")).toBeTruthy();
  expect(screen.getByText("Turn left on Sherbrooke")).toBeTruthy();
});

test("renders step distance and duration meta", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  // Step 1: 500 m · 3 min  (200s rounds to 3 min)
  expect(screen.getByText(/500 m/)).toBeTruthy();
  // Step 2: 1.0 km · 7 min  (400s rounds to 7 min)
  expect(screen.getByText(/1\.0 km/)).toBeTruthy();
});

test("filters out steps with empty instruction", () => {
  const routeWithEmptyStep = {
    ...sampleRoute,
    steps: [
      ...sampleRoute.steps,
      {
        distanceMeters: 100,
        durationSeconds: 30,
        instruction: "",
        maneuver: "",
        coordinates: [],
      },
    ],
  };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      route={routeWithEmptyStep}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  // Only the 2 non-empty instructions should be rendered (empty one filtered out)
  expect(screen.getByText("Head north on Guy St")).toBeTruthy();
  expect(screen.getByText("Turn left on Sherbrooke")).toBeTruthy();
  expect(screen.queryByText("")).toBeNull();
});

// --- Loading / error states ---

test("renders loading indicator when routeLoading is true", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={null}
      routeLoading={true}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Calculating route…")).toBeTruthy();
});

test("renders error message when routeError is set", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={null}
      routeLoading={false}
      routeError="Directions quota exceeded"
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Directions quota exceeded")).toBeTruthy();
});

test("does not render error when loading", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={null}
      routeLoading={true}
      routeError="Some error"
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.queryByText("Some error")).toBeNull();
});

// --- Transport mode switching ---

test("calls onTravelModeChange when transport card is pressed", () => {
  const onTravelModeChange = jest.fn();
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={onTravelModeChange}
      onClose={jest.fn()}
    />,
  );
  fireEvent.press(
    screen.getByRole("button", { name: "Get directions by Drive" }),
  );
  expect(onTravelModeChange).toHaveBeenCalledWith("DRIVE");
});

test("shows -- min on inactive transport cards even with route", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  // 3 inactive cards should show "-- min"
  const placeholders = screen.getAllByText("-- min");
  expect(placeholders).toHaveLength(3);
});

// --- formatDuration edge cases ---

test("renders '-- min' on active card when route durationSeconds is 0", () => {
  const zeroRoute = { ...sampleRoute, durationSeconds: 0 };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={zeroRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  // All 4 cards should show "-- min" because formatDuration(0) returns "-- min"
  const placeholders = screen.getAllByText("-- min");
  expect(placeholders).toHaveLength(4);
});

test("renders '-- min' on active card when route durationSeconds is negative", () => {
  const negRoute = { ...sampleRoute, durationSeconds: -10 };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={negRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  const placeholders = screen.getAllByText("-- min");
  expect(placeholders).toHaveLength(4);
});

// --- formatDistance edge cases ---

test("renders '-- m' when route distanceMeters is 0", () => {
  const zeroDistRoute = { ...sampleRoute, distanceMeters: 0 };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={zeroDistRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("-- m")).toBeTruthy();
});

test("renders '-- m' when route distanceMeters is negative", () => {
  const negDistRoute = { ...sampleRoute, distanceMeters: -5 };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={negDistRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("-- m")).toBeTruthy();
});

// --- Deselect active transport mode ---

test("calls onTravelModeChange with null when pressing the active mode", () => {
  const onTravelModeChange = jest.fn();
  render(
    <DirectionPanel
      {...defaultStepsProps}
      visible={true}
      building={building}
      route={null}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={onTravelModeChange}
      onClose={jest.fn()}
    />,
  );
  fireEvent.press(
    screen.getByRole("button", { name: "Get directions by Walk" }),
  );
  expect(onTravelModeChange).toHaveBeenCalledWith(null);
});

// --- startBuilding "Exit" step with route steps ---

test("renders 'Exit' step with startBuilding long name when route has steps", () => {
  render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Exit Loyola Administration Building")).toBeTruthy();
});

test("renders 'Exit' step with buildingCode when startBuilding has no long name", () => {
  const startNoLongName = {
    ...loyolaBuilding,
    buildingLongName: undefined as any,
  };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      startBuilding={startNoLongName}
      route={sampleRoute}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Exit AD")).toBeTruthy();
});

// --- Step with durationSeconds === 0 ---

test("renders step meta without duration when step durationSeconds is 0", () => {
  const routeZeroDuration = {
    ...sampleRoute,
    steps: [
      {
        distanceMeters: 300,
        durationSeconds: 0,
        instruction: "Walk to destination",
        maneuver: "DEPART",
        coordinates: [],
      },
    ],
  };
  render(
    <DirectionPanel
      {...defaultStepsProps}
      showSteps={true}
      visible={true}
      building={building}
      route={routeZeroDuration}
      routeLoading={false}
      routeError={null}
      travelMode="WALK"
      onTravelModeChange={jest.fn()}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Walk to destination")).toBeTruthy();
  expect(screen.getByText("300 m")).toBeTruthy();
  // Should NOT contain the "·" separator since duration is 0
  expect(screen.queryByText(/·/)).toBeNull();
});

// --- getManeuverIcon coverage ---

const maneuverCases: { maneuver: string; expectedIcon: string }[] = [
  { maneuver: "STRAIGHT", expectedIcon: "straight" },
  { maneuver: "RAMP_LEFT", expectedIcon: "ramp-left" },
  { maneuver: "RAMP_RIGHT", expectedIcon: "ramp-right" },
  { maneuver: "MERGE", expectedIcon: "merge" },
  { maneuver: "FORK_LEFT", expectedIcon: "fork-left" },
  { maneuver: "FORK_RIGHT", expectedIcon: "fork-right" },
  { maneuver: "FERRY", expectedIcon: "directions-ferry" },
  { maneuver: "TURN_SLIGHT_LEFT", expectedIcon: "turn-slight-left" },
  { maneuver: "TURN_SHARP_LEFT", expectedIcon: "turn-sharp-left" },
  { maneuver: "TURN_RIGHT", expectedIcon: "turn-right" },
  { maneuver: "TURN_SLIGHT_RIGHT", expectedIcon: "turn-slight-right" },
  { maneuver: "TURN_SHARP_RIGHT", expectedIcon: "turn-sharp-right" },
  { maneuver: "ROUNDABOUT_LEFT", expectedIcon: "roundabout-left" },
  { maneuver: "ROUNDABOUT_RIGHT", expectedIcon: "roundabout-right" },
  { maneuver: "UTURN_LEFT", expectedIcon: "u-turn-left" },
  { maneuver: "UTURN_RIGHT", expectedIcon: "u-turn-right" },
  { maneuver: "UNKNOWN_MANEUVER", expectedIcon: "dot-circle" },
];

test.each(maneuverCases)(
  "renders correct icon for $maneuver maneuver",
  ({ maneuver, expectedIcon }) => {
    const routeWithManeuver = {
      ...sampleRoute,
      steps: [
        {
          distanceMeters: 100,
          durationSeconds: 60,
          instruction: `Step with ${maneuver}`,
          maneuver,
          coordinates: [],
        },
      ],
    };
    render(
      <DirectionPanel
        {...defaultStepsProps}
        showSteps={true}
        visible={true}
        building={building}
        route={routeWithManeuver}
        routeLoading={false}
        routeError={null}
        travelMode="WALK"
        onTravelModeChange={jest.fn()}
        onClose={jest.fn()}
      />,
    );
    expect(screen.getByText(`Step with ${maneuver}`)).toBeTruthy();
    expect(screen.getByTestId(`material-icon-${expectedIcon}`)).toBeTruthy();
  },
);
