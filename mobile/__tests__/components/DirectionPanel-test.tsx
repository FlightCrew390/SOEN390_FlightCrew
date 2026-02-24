import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

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
  expect(screen.getByText("1455 De Maisonneuve Blvd. W.")).toBeTruthy();
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
