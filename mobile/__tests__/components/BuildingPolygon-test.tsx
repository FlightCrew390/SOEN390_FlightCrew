import { render } from "@testing-library/react-native";
import React from "react";

import BuildingPolygon from "../../src/components/LocationScreen/BuildingPolygon";
import { Building, StructureType } from "../../src/types/Building";

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const PolygonMock = (props: any) =>
    React.createElement("Polygon", props, props.children);
  PolygonMock.displayName = "Polygon";
  return {
    __esModule: true,
    Polygon: PolygonMock,
  };
});

const makeBuilding = (overrides: Partial<Building> = {}): Building => ({
  structureType: StructureType.Building,
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
  ...overrides,
});

describe("BuildingPolygon", () => {
  it("renders null when building has no polygons", () => {
    const building = makeBuilding({ polygons: undefined });
    const { toJSON } = render(<BuildingPolygon building={building} />);
    expect(toJSON()).toBeNull();
  });

  it("renders null when building has empty polygons array", () => {
    const building = makeBuilding({ polygons: [] });
    const { toJSON } = render(<BuildingPolygon building={building} />);
    expect(toJSON()).toBeNull();
  });

  it("renders Polygon components when building has polygons", () => {
    const polygons = [
      [
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.498, longitude: -73.578 },
        { latitude: 45.497, longitude: -73.577 },
      ],
    ];
    const building = makeBuilding({ polygons });
    const { toJSON } = render(<BuildingPolygon building={building} />);
    expect(toJSON()).not.toBeNull();
  });

  it("renders correct number of polygons", () => {
    const polygons = [
      [
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.498, longitude: -73.578 },
      ],
      [
        { latitude: 45.499, longitude: -73.576 },
        { latitude: 45.5, longitude: -73.575 },
      ],
    ];
    const building = makeBuilding({ polygons });
    const view = render(<BuildingPolygon building={building} />);
    const json = view.toJSON();
    // Should render an array of 2 Polygon elements
    expect(Array.isArray(json)).toBe(true);
    expect((json as any[]).length).toBe(2);
  });

  it("passes correct props to Polygon", () => {
    const polygons = [
      [
        { latitude: 45.497, longitude: -73.579 },
        { latitude: 45.498, longitude: -73.578 },
      ],
    ];
    const building = makeBuilding({ buildingCode: "EV", polygons });
    const view = render(<BuildingPolygon building={building} />);
    const json = view.toJSON() as any;
    // Single polygon renders directly (not as array)
    const polygon = Array.isArray(json) ? json[0] : json;
    expect(polygon.props.coordinates).toEqual(polygons[0]);
    expect(polygon.props.strokeWidth).toBe(2);
    expect(polygon.props.fillColor).toBe("rgba(156, 45, 45, 0.3)");
  });
});
