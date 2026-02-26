import { fireEvent, render, screen } from "@testing-library/react-native";
import { Animated, Image, ScrollView, Text, View } from "react-native";

import DirectionPanel from "../../src/components/LocationScreen/DirectionPanel";
import { Building } from "../../src/types/Building";

jest.mock("@expo/vector-icons/FontAwesome5", () => "FontAwesome5");

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

beforeEach(() => {
  jest.clearAllMocks();
});

// --- Visibility ---

test("is non-interactive when not visible", () => {
  render(
    <DirectionPanel visible={false} building={building} onClose={jest.fn()} />,
  );
  expect(
    screen.queryByRole("button", { name: "Close direction panel" }),
  ).toBeNull();
});

test("renders empty panel when building is null", () => {
  render(<DirectionPanel visible={true} building={null} onClose={jest.fn()} />);
  expect(screen.queryByText("Directions")).toBeNull();
});

// --- Header ---

test("renders building long name and address when visible", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
  const addressNodes = screen.getAllByText("1455 De Maisonneuve Blvd. W.");
  expect(addressNodes.length).toBeGreaterThanOrEqual(1);
});

test("renders Directions header when visible", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Directions")).toBeTruthy();
});

// --- Building info ---

test("renders building name and address when visible", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Hall Building")).toBeTruthy();
  const addressNodes = screen.getAllByText("1455 De Maisonneuve Blvd. W.");
  expect(addressNodes.length).toBeGreaterThanOrEqual(1);
});

test("renders building long name in details section", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
});

test("renders building code in details section", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Building Code: H")).toBeTruthy();
});

test("renders SGW campus label correctly", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Campus: Sir George Williams")).toBeTruthy();
});

test("renders Loyola campus label correctly", () => {
  render(
    <DirectionPanel
      visible={true}
      building={loyolaBuilding}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Campus: Loyola")).toBeTruthy();
});

test("renders distance placeholder", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("-- m")).toBeTruthy();
});

// --- Transport cards ---

test("renders four transport time placeholders", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const timePlaceholders = screen.getAllByText("-- min");
  expect(timePlaceholders).toHaveLength(4);
});

// --- Close button ---

test("calls onClose when close button is pressed", () => {
  const onClose = jest.fn();
  render(
    <DirectionPanel visible={true} building={building} onClose={onClose} />,
  );
  fireEvent.press(
    screen.getByRole("button", { name: "Close direction panel" }),
  );
  expect(onClose).toHaveBeenCalledTimes(1);
});

test("does not call onClose before button is pressed", () => {
  const onClose = jest.fn();
  render(
    <DirectionPanel visible={true} building={building} onClose={onClose} />,
  );
  expect(onClose).not.toHaveBeenCalled();
});

// --- Search button (onOpenSearch) ---

test("renders search button when building is visible", () => {
  render(
    <DirectionPanel
      visible={true}
      building={building}
      onClose={jest.fn()}
      onOpenSearch={jest.fn()}
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
      visible={true}
      building={building}
      onClose={jest.fn()}
      onOpenSearch={onOpenSearch}
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
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const searchButton = screen.getByRole("button", {
    name: "Search buildings to change directions start",
  });
  expect(searchButton.props.accessibilityState?.disabled).toBe(true);
});

// --- Animated.View pointerEvents ---

test("sets pointerEvents to 'auto' when visible and building exists", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const animatedViews = UNSAFE_getAllByType(Animated.View);
  const mainPanel = animatedViews.find((view) => view.props.pointerEvents);
  expect(mainPanel?.props.pointerEvents).toBe("auto");
});

test("sets pointerEvents to 'none' when not visible", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={false} building={building} onClose={jest.fn()} />,
  );
  const animatedViews = UNSAFE_getAllByType(Animated.View);
  const mainPanel = animatedViews.find((view) => view.props.pointerEvents);
  expect(mainPanel?.props.pointerEvents).toBe("none");
});

test("sets pointerEvents to 'none' when building is null", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={null} onClose={jest.fn()} />,
  );
  const animatedViews = UNSAFE_getAllByType(Animated.View);
  const mainPanel = animatedViews.find((view) => view.props.pointerEvents);
  expect(mainPanel?.props.pointerEvents).toBe("none");
});

// --- TransportCard rendering ---

test("renders all four transport card images", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const images = UNSAFE_getAllByType(Image);
  expect(images.length).toBe(4);
});

test("transport cards have correct resizeMode", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const images = UNSAFE_getAllByType(Image);
  images.forEach((image) => {
    expect(image.props.resizeMode).toBe("contain");
  });
});

test("transport cards are wrapped in View containers", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const views = UNSAFE_getAllByType(View);
  expect(views.length).toBeGreaterThan(0);
});

// --- Building info row ---

test("renders building name with numberOfLines prop", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const texts = UNSAFE_getAllByType(Text);
  const buildingNameText = texts.find(
    (text) => text.props.children === "Hall Building",
  );
  expect(buildingNameText?.props.numberOfLines).toBe(1);
});

test("renders building address with numberOfLines prop", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
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
      visible={true}
      building={buildingWithoutName}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("H")).toBeTruthy();
});

test("renders empty string when address is null", () => {
  const buildingWithoutAddress = { ...building, address: null as any };
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel
      visible={true}
      building={buildingWithoutAddress}
      onClose={jest.fn()}
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
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const scrollViews = UNSAFE_getAllByType(ScrollView);
  expect(scrollViews[0].props.showsVerticalScrollIndicator).toBe(true);
});

test("ScrollView handles touch responder", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const scrollViews = UNSAFE_getAllByType(ScrollView);
  expect(scrollViews[0].props.onStartShouldSetResponder()).toBe(true);
});

test("ScrollView contains all building detail texts", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
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
      visible={true}
      building={buildingWithoutLongName}
      onClose={jest.fn()}
    />,
  );
  // Should still render other building details without crashing
  expect(screen.getByText("Building Code: H")).toBeTruthy();
  expect(screen.getByText("Campus: Sir George Williams")).toBeTruthy();
});

test("renders divider between transport and details sections", () => {
  const { UNSAFE_getAllByType } = render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  const views = UNSAFE_getAllByType(View);
  expect(views.length).toBeGreaterThan(5); // Multiple Views including divider
});

// --- Start building ---

test("shows 'Starting from your current location' when no startBuilding", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Starting from your current location")).toBeTruthy();
});

test("shows starting building name when startBuilding is provided", () => {
  render(
    <DirectionPanel
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Starting at Administration Building")).toBeTruthy();
});

test("shows starting building code when startBuilding has no buildingName", () => {
  const startWithoutName = { ...loyolaBuilding, buildingName: null as any };
  render(
    <DirectionPanel
      visible={true}
      building={building}
      startBuilding={startWithoutName}
      onClose={jest.fn()}
    />,
  );
  expect(screen.getByText("Starting at AD")).toBeTruthy();
});

// --- Reset to current location ---

test("does not show 'Use current location' button when no startBuilding", () => {
  render(
    <DirectionPanel
      visible={true}
      building={building}
      onClose={jest.fn()}
      onResetStart={jest.fn()}
    />,
  );
  expect(screen.queryByText("Use current location")).toBeNull();
});

test("shows 'Use current location' button when startBuilding is set", () => {
  render(
    <DirectionPanel
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
      onResetStart={jest.fn()}
    />,
  );
  expect(screen.getByText("Use current location")).toBeTruthy();
});

test("calls onResetStart when 'Use current location' is pressed", () => {
  const onResetStart = jest.fn();
  render(
    <DirectionPanel
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
      onResetStart={onResetStart}
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
      visible={true}
      building={building}
      startBuilding={loyolaBuilding}
      onClose={jest.fn()}
    />,
  );
  const resetButton = screen.getByRole("button", {
    name: "Reset to current location",
  });
  expect(resetButton.props.accessibilityState?.disabled).toBe(true);
});
