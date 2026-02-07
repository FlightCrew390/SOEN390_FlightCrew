import { render } from "@testing-library/react-native";
import React from "react";

import BuildingMarker from "../src/components/LocationScreen/BuildingMarker";
import { Building } from "../src/types/Building";

jest.mock("react-native-maps", () => ({
  __esModule: true,
  Marker: "Marker",
}));

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
