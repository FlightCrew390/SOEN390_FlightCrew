import { Building } from "../../src/types/Building";
import {
  calculateDistance,
  findCurrentBuilding,
} from "../../src/utils/buildingDetection";

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
    buildingCode: "CC",
    buildingName: "Central Building",
    buildingLongName: "Central Building",
    address: "7141 Sherbrooke St. W.",
    latitude: 45.4582,
    longitude: -73.6405,
  },
];

describe("calculateDistance", () => {
  test("returns 0 for identical coordinates", () => {
    const result = calculateDistance(45.4973, -73.5789, 45.4973, -73.5789);
    expect(result).toBe(0);
  });

  test("calculates distance between two points", () => {
    // Distance between SGW and Loyola campuses (approx 5.5 km)
    const result = calculateDistance(45.4973, -73.5789, 45.4582, -73.6405);
    expect(result).toBeGreaterThan(5000);
    expect(result).toBeLessThan(6500);
  });

  test("returns same distance regardless of direction", () => {
    const distanceAB = calculateDistance(45.4973, -73.5789, 45.4582, -73.6405);
    const distanceBA = calculateDistance(45.4582, -73.6405, 45.4973, -73.5789);
    expect(distanceAB).toBeCloseTo(distanceBA, 5);
  });
});

describe("findCurrentBuilding", () => {
  test("returns null for empty buildings array", () => {
    const result = findCurrentBuilding(
      { latitude: 45.4973, longitude: -73.5789 },
      [],
    );
    expect(result).toBeNull();
  });

  test("returns null for null buildings", () => {
    const result = findCurrentBuilding(
      { latitude: 45.4973, longitude: -73.5789 },
      null as unknown as Building[],
    );
    expect(result).toBeNull();
  });

  test("finds building when user is at exact location", () => {
    const result = findCurrentBuilding(
      { latitude: 45.4973, longitude: -73.5789 },
      mockBuildings,
    );
    expect(result).toEqual(mockBuildings[0]);
  });

  test("finds nearest building when user is within threshold", () => {
    const result = findCurrentBuilding(
      { latitude: 45.4974, longitude: -73.579 },
      mockBuildings,
      100,
    );
    expect(result?.buildingCode).toBe("H");
  });

  test("returns null when user is outside threshold", () => {
    const result = findCurrentBuilding(
      { latitude: 46, longitude: -74 },
      mockBuildings,
      100,
    );
    expect(result).toBeNull();
  });

  test("uses custom threshold correctly", () => {
    // User is very far from any building
    const farLocation = { latitude: 46, longitude: -74 };

    // With a very large threshold, should find nearest
    const resultLargeThreshold = findCurrentBuilding(
      farLocation,
      mockBuildings,
      100000,
    );
    expect(resultLargeThreshold).not.toBeNull();

    // With small threshold, should return null
    const resultSmallThreshold = findCurrentBuilding(
      farLocation,
      mockBuildings,
      10,
    );
    expect(resultSmallThreshold).toBeNull();
  });

  test("skips buildings without coordinates", () => {
    const buildingsWithMissing: Building[] = [
      {
        campus: "SGW",
        buildingCode: "X",
        buildingName: "No Coords",
        buildingLongName: "Building Without Coords",
        address: "Unknown",
        latitude: undefined as unknown as number,
        longitude: undefined as unknown as number,
      },
      mockBuildings[0],
    ];

    const result = findCurrentBuilding(
      { latitude: 45.4973, longitude: -73.5789 },
      buildingsWithMissing,
    );
    expect(result?.buildingCode).toBe("H");
  });
});
