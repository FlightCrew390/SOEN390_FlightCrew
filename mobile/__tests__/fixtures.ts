import { Building } from "../src/types/Building";
import { RouteInfo, StepInfo } from "../src/types/Directions";
/**
 * Shared test fixtures used across all test files.
 */

export function makeBuilding(overrides: Partial<Building> = {}): Building {
  return {
    buildingCode: "H",
    buildingName: "Hall Building",
    buildingLongName: "Henry F. Hall Building",
    address: "1455 De Maisonneuve Blvd. W.",
    latitude: 45.4973,
    longitude: -73.5789,
    campus: "SGW",
    polygons: [],
    ...overrides,
  } as Building;
}

export const hallBuilding = makeBuilding();

export const libraryBuilding = makeBuilding({
  buildingCode: "LB",
  buildingName: "Library Building",
  buildingLongName: "J.W. McConnell Building",
  address: "1400 De Maisonneuve Blvd. W.",
  latitude: 45.4968,
  longitude: -73.5793,
});

export const loyolaBuilding = makeBuilding({
  buildingCode: "CC",
  buildingName: "Central Building",
  buildingLongName: "Central Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.458,
  longitude: -73.6405,
  campus: "LOY",
});

export const googlePlaceBuilding = makeBuilding({
  buildingCode: "EV",
  buildingName: "Engineering Building",
  buildingLongName:
    "Engineering, Computer Science and Visual Arts Integrated Complex",
  address: "1515 Ste-Catherine St. W.",
  latitude: 45.4955,
  longitude: -73.5778,
  Google_Place_Info: {
    displayName: { text: "EV Building Concordia" },
    formattedAddress: "1515 Sainte-Catherine St. W., Montreal",
  } as Building["Google_Place_Info"] & { formattedAddress: string },
});

export const testBuildings: Building[] = [
  hallBuilding,
  libraryBuilding,
  loyolaBuilding,
  googlePlaceBuilding,
];

export function makeStep(overrides: Partial<StepInfo> = {}): StepInfo {
  return {
    id: "test-step",
    distanceMeters: 100,
    durationSeconds: 60,
    instruction: "Walk north on Guy Street",
    maneuver: "STRAIGHT",
    coordinates: [
      { latitude: 45.4973, longitude: -73.5789 },
      { latitude: 45.498, longitude: -73.5789 },
    ],
    travelMode: "WALK", // Default travel mode
    ...overrides,
  };
}

export function makeRoute(overrides: Partial<RouteInfo> = {}): RouteInfo {
  return {
    coordinates: [
      { latitude: 45.4973, longitude: -73.5789 },
      { latitude: 45.498, longitude: -73.5795 },
      { latitude: 45.4968, longitude: -73.5793 },
    ],
    distanceMeters: 350,
    durationSeconds: 240,
    steps: [
      makeStep({ instruction: "Head north on Guy St", maneuver: "DEPART" }),
      makeStep({
        instruction: "Turn left on De Maisonneuve",
        maneuver: "TURN_LEFT",
      }),
    ],
    ...overrides,
  };
}
