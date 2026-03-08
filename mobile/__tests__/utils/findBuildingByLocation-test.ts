import { Building, StructureType } from "../../src/types/Building";
import { findBuildingByLocation } from "../../src/utils/findBuildingByLocation";

const mockBuildings: Building[] = [
  {
    campus: "SGW",
    buildingCode: "H",
    buildingName: "Hall Building",
    buildingLongName: "Hall Building - SGW Campus",
    address: "1455 De Maisonneuve Blvd W, Montreal, QC H3G 1M8",
    latitude: 45.4972,
    longitude: -73.5795,
    structureType: "BUILDING" as StructureType,
    accessibilityInfo: "Wheelchair accessible entrance on the east side.",
  },
  {
    campus: "LOY",
    buildingCode: "MB",
    buildingName: "Mackay Building",
    buildingLongName: "Mackay Building - LOY Campus",
    address: "3465 McTavish St, Montreal, QC H3A 0E6",
    latitude: 45.5048,
    longitude: -73.5772,
    structureType: "BUILDING" as StructureType,
    accessibilityInfo: "Accessible via main entrance on McTavish Street.",
  },
];

describe("findBuildingByLocation", () => {
  test("returns null for empty location", () => {
    expect(findBuildingByLocation("", mockBuildings)).toBeNull();
  });

  test("returns null for non-matching location", () => {
    expect(
      findBuildingByLocation("Nonexistent Place", mockBuildings),
    ).toBeNull();
  });

  test("matches by structured format", () => {
    expect(
      findBuildingByLocation("SGW - Hall Building Rm 101", mockBuildings),
    ).toEqual(mockBuildings[0]);
    expect(
      findBuildingByLocation("LOY - Mackay Building Rm 202", mockBuildings),
    ).toEqual(mockBuildings[1]);
  });

  test("matches by building code", () => {
    expect(findBuildingByLocation("H", mockBuildings)).toEqual(
      mockBuildings[0],
    );
    expect(findBuildingByLocation("MB", mockBuildings)).toEqual(
      mockBuildings[1],
    );
    expect(findBuildingByLocation("MB 3.270", mockBuildings)).toEqual(
      mockBuildings[1],
    );
  });

  test("matches by name containment", () => {
    expect(findBuildingByLocation("Hall", mockBuildings)).toEqual(
      mockBuildings[0],
    );
    expect(findBuildingByLocation("Mackay", mockBuildings)).toEqual(
      mockBuildings[1],
    );
  });

  test("matches by address overlap", () => {
    expect(
      findBuildingByLocation("1455 De Maisonneuve Blvd W", mockBuildings),
    ).toEqual(mockBuildings[0]);
    expect(findBuildingByLocation("3465 McTavish St", mockBuildings)).toEqual(
      mockBuildings[1],
    );
  });
});
