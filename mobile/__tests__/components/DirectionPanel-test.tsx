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
    addressRow: {},
    searchButtonLeftOfAddress: {},
    buildingAddress: {},
  },
}));

const building: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("is non-interactive when not visible", () => {
  render(
    <DirectionPanel visible={false} building={building} onClose={jest.fn()} />,
  );
  // Close button should not be rendered when hidden
  expect(
    screen.queryByRole("button", { name: "Close direction panel" }),
  ).toBeNull();
});

test("renders empty panel when building is null", () => {
  render(<DirectionPanel visible={true} building={null} onClose={jest.fn()} />);
  // Content should not be present when building is null
  expect(screen.queryByText("Directions")).toBeNull();
});

test("renders building long name and address when visible", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
  expect(screen.getByText("1455 De Maisonneuve Blvd. W.")).toBeTruthy();
});

test("renders Directions header when visible", () => {
  render(
    <DirectionPanel visible={true} building={building} onClose={jest.fn()} />,
  );
  expect(screen.getByText("Directions")).toBeTruthy();
});

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
