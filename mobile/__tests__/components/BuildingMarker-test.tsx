import { render, fireEvent } from "@testing-library/react-native";
import React from "react";

import BuildingMarker from "../../src/components/LocationScreen/BuildingMarker";
import { Building } from "../../src/types/Building";

// Track the latest Marker props and ref methods for assertion
const mockShowCallout = jest.fn();
let capturedMarkerProps: any = null;

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const MarkerMock = React.forwardRef((props: any, ref: any) => {
    capturedMarkerProps = props;
    React.useImperativeHandle(ref, () => ({
      showCallout: mockShowCallout,
    }));
    return React.createElement("Marker", props, props.children);
  });
  MarkerMock.displayName = "Marker";
  return {
    __esModule: true,
    Marker: MarkerMock,
    MapMarker: MarkerMock,
  };
});

// Mock react-native-svg
jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: "Svg",
  Circle: "Circle",
  Path: "Path",
}));

const createBuilding = (overrides: Partial<Building> = {}): Building => ({
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  capturedMarkerProps = null;
});

test("renders marker when building has valid coordinates", () => {
  const building = createBuilding();

  const { toJSON } = render(<BuildingMarker building={building} />);

  expect(toJSON()).toBeTruthy();
});

test("returns null when latitude is missing", () => {
  const building = createBuilding({ latitude: undefined });

  const { toJSON } = render(<BuildingMarker building={building} />);

  expect(toJSON()).toBeNull();
});

test("returns null when longitude is missing", () => {
  const building = createBuilding({ longitude: undefined });

  const { toJSON } = render(<BuildingMarker building={building} />);

  expect(toJSON()).toBeNull();
});

test("returns null when both coordinates are missing", () => {
  const building = createBuilding({
    latitude: undefined,
    longitude: undefined,
  });

  const { toJSON } = render(<BuildingMarker building={building} />);

  expect(toJSON()).toBeNull();
});

test("displays building code as title", () => {
  const building = createBuilding({ buildingCode: "EV" });

  const { toJSON } = render(<BuildingMarker building={building} />);
  const tree = toJSON();

  expect(tree).toBeTruthy();
  expect(JSON.stringify(tree)).toContain("EV");
});

test("displays building name as description", () => {
  const building = createBuilding({ buildingName: "Engineering Building" });

  const { toJSON } = render(<BuildingMarker building={building} />);
  const tree = toJSON();

  expect(tree).toBeTruthy();
  expect(JSON.stringify(tree)).toContain("Engineering Building");
});

test("renders highlighted marker when isCurrentBuilding is true", () => {
  const building = createBuilding();

  const { toJSON } = render(
    <BuildingMarker building={building} isCurrentBuilding={true} />,
  );

  expect(toJSON()).toBeTruthy();
});

test("calls onPress with building when marker is pressed", () => {
  const building = createBuilding();
  const onPress = jest.fn();

  render(<BuildingMarker building={building} onPress={onPress} />);

  expect(capturedMarkerProps.onPress).toBeDefined();
  capturedMarkerProps.onPress();
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(onPress).toHaveBeenCalledWith(building);
});
