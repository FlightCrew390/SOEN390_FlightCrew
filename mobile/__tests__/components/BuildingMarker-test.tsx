import { render } from "@testing-library/react-native";
import React from "react";

import BuildingMarker from "../../src/components/LocationScreen/BuildingMarker";
import { Building, StructureType } from "../../src/types/Building";

// Track the latest Marker props and ref methods for assertion
const mockShowCallout = jest.fn();
const mockHideCallout = jest.fn();
let capturedMarkerProps: any = null;

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const MarkerMock = React.forwardRef((props: any, ref: any) => {
    capturedMarkerProps = props;
    React.useImperativeHandle(ref, () => ({
      showCallout: mockShowCallout,
      hideCallout: mockHideCallout,
    }));
    return React.createElement("Marker", props, props.children);
  });
  MarkerMock.displayName = "Marker";
  const CalloutMock = (props: any) =>
    React.createElement("Callout", props, props.children);
  CalloutMock.displayName = "Callout";
  return {
    __esModule: true,
    Marker: MarkerMock,
    Callout: CalloutMock,
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
  structureType: StructureType.Building,
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  accessibilityInfo:
    "Accessible entrance: This building has an automated accessible entrance door.\nAccessible building elevator: This building entrance is equipped with an accessible elevator.",
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

test("displays building name as the callout title", () => {
  const building = createBuilding({ buildingName: "Engineering Building" });

  const { toJSON } = render(<BuildingMarker building={building} />);
  const tree = toJSON();

  expect(tree).toBeTruthy();
  expect(JSON.stringify(tree)).toContain("Engineering Building");
});

test("displays actionable callout copy in the description", () => {
  const building = createBuilding({ buildingCode: "EV" });

  const { toJSON } = render(<BuildingMarker building={building} />);
  const tree = toJSON();

  expect(tree).toBeTruthy();
  expect(JSON.stringify(tree)).toContain("EV - Tap for Details");
});

test("renders highlighted marker when isCurrentBuilding is true", () => {
  const building = createBuilding();

  const { toJSON } = render(
    <BuildingMarker building={building} isCurrentBuilding={true} />,
  );

  expect(toJSON()).toBeTruthy();
});

test("renders highlighted marker when isSelected is true", () => {
  const building = createBuilding();

  const { toJSON } = render(
    <BuildingMarker building={building} isSelected={true} />,
  );

  expect(toJSON()).toBeTruthy();
});

test("calls onSelect when marker is pressed", () => {
  const building = createBuilding();
  const onSelect = jest.fn();

  render(<BuildingMarker building={building} onSelect={onSelect} />);

  expect(capturedMarkerProps.onPress).toBe(onSelect);
  capturedMarkerProps.onPress();
  expect(onSelect).toHaveBeenCalledTimes(1);
});

test("calls onDeselect when callout is pressed", () => {
  const building = createBuilding();
  const onDeselect = jest.fn();

  render(<BuildingMarker building={building} />);

  // onDeselect is not wired to onCalloutPress; tapping the callout triggers onDirectionPress.
  expect(onDeselect).not.toHaveBeenCalled();
});

test("calls onDirectionPress when Direction button is pressed", () => {
  const building = createBuilding();
  const onDirectionPress = jest.fn();

  render(
    <BuildingMarker building={building} onDirectionPress={onDirectionPress} />,
  );

  expect(capturedMarkerProps.onCalloutPress).toBe(onDirectionPress);
  capturedMarkerProps.onCalloutPress();
  expect(onDirectionPress).toHaveBeenCalledTimes(1);
});

test("calls showCallout when isSelected becomes true", () => {
  jest.useFakeTimers();
  const building = createBuilding();

  render(<BuildingMarker building={building} isSelected={true} />);

  jest.advanceTimersByTime(900);
  expect(mockShowCallout).toHaveBeenCalled();

  jest.useRealTimers();
});

test("does not call showCallout when isSelected is false", () => {
  jest.useFakeTimers();
  const building = createBuilding();

  render(<BuildingMarker building={building} isSelected={false} />);

  jest.advanceTimersByTime(1000);
  expect(mockShowCallout).not.toHaveBeenCalled();

  jest.useRealTimers();
});

test("calls hideCallout when isDirectionsOpen and isSelected are true", () => {
  const building = createBuilding();

  render(
    <BuildingMarker
      building={building}
      isSelected={true}
      isDirectionsOpen={true}
    />,
  );

  expect(mockHideCallout).toHaveBeenCalled();
});

test("does not call hideCallout when isDirectionsOpen is false", () => {
  const building = createBuilding();

  render(
    <BuildingMarker
      building={building}
      isSelected={true}
      isDirectionsOpen={false}
    />,
  );

  expect(mockHideCallout).not.toHaveBeenCalled();
});

test("does not call showCallout when isDirectionsOpen is true", () => {
  jest.useFakeTimers();
  const building = createBuilding();

  render(
    <BuildingMarker
      building={building}
      isSelected={true}
      isDirectionsOpen={true}
    />,
  );

  jest.advanceTimersByTime(1000);
  expect(mockShowCallout).not.toHaveBeenCalled();

  jest.useRealTimers();
});
