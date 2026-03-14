import { ShuttleDirectionsBuilder } from "../../src/services/ShuttleDirectionsBuilder";
import { DirectionsService } from "../../src/services/DirectionsService";
import { ShuttleService } from "../../src/services/ShuttleService";
import {
  RouteInfo,
  DEFAULT_DEPARTURE_CONFIG,
} from "../../src/types/Directions";
import { Building, StructureType } from "../../src/types/Building";

jest.mock("../../src/services/DirectionsService");
jest.mock("../../src/services/ShuttleService");

const mockFetchDirections =
  DirectionsService.fetchDirections as jest.MockedFunction<
    typeof DirectionsService.fetchDirections
  >;
const mockGetSchedule = ShuttleService.getSchedule as jest.MockedFunction<
  typeof ShuttleService.getSchedule
>;
const mockGetRoute = ShuttleService.getRoute as jest.MockedFunction<
  typeof ShuttleService.getRoute
>;

const sgwBuilding: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
  structureType: StructureType.Building,
  accessibilityInfo: "N/A",
};

const loyBuilding: Building = {
  campus: "LOY",
  buildingCode: "AD",
  buildingName: "Admin Building",
  buildingLongName: "Loyola Administration Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.4582,
  longitude: -73.6405,
  structureType: StructureType.Building,
  accessibilityInfo: "N/A",
};

const mockWalkRoute: RouteInfo = {
  coordinates: [{ latitude: 45.497, longitude: -73.579 }],
  distanceMeters: 200,
  durationSeconds: 180,
  steps: [
    {
      distanceMeters: 200,
      durationSeconds: 180,
      instruction: "Walk north",
      maneuver: "DEPART",
      coordinates: [{ latitude: 45.497, longitude: -73.579 }],
    },
  ],
};

const mockSchedule = {
  day: "MONDAY",
  no_service: false,
  service_start: "09:15",
  service_end: "18:30",
  departures: [
    { loyola_departure: "09:15", sgw_departure: "09:30", last_bus: false },
    { loyola_departure: "12:00", sgw_departure: "12:15", last_bus: false },
    { loyola_departure: "18:15", sgw_departure: "18:30", last_bus: true },
  ],
};

const mockShuttleRoute = {
  duration: "21 mins",
  distance: "8.3 km",
  sgw_to_loyola: [
    { latitude: 45.49697, longitude: -73.57851 },
    { latitude: 45.45865, longitude: -73.63896 },
  ],
  loyola_to_sgw: [
    { latitude: 45.45865, longitude: -73.63896 },
    { latitude: 45.49697, longitude: -73.57851 },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  // Default: set "now" to a Monday at 10:00
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 2, 2, 10, 0, 0)); // Monday March 2 2026 10:00
});

afterEach(() => {
  jest.useRealTimers();
});

describe("ShuttleDirectionsBuilder", () => {
  it("builds a composite route for cross-campus travel", async () => {
    mockGetSchedule.mockResolvedValue(mockSchedule);
    mockGetRoute.mockResolvedValue(mockShuttleRoute);
    mockFetchDirections.mockResolvedValue(mockWalkRoute);

    const result = await ShuttleDirectionsBuilder.buildShuttleRoute(
      loyBuilding.latitude,
      loyBuilding.longitude,
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      loyBuilding,
      sgwBuilding,
    );

    expect(result).not.toBeNull();
    expect(result).not.toBeNull();
    expect(result!.steps.length).toBeGreaterThan(0);
    const shuttleStep = result!.steps.find(
      (s) => s.transitDetails?.vehicleName === "Concordia Shuttle",
    );
    expect(shuttleStep).toBeDefined();
    expect(mockGetSchedule).toHaveBeenCalledTimes(1);
    expect(mockGetRoute).toHaveBeenCalledTimes(1);
    expect(mockFetchDirections).toHaveBeenCalledTimes(2);
  });

  it("returns null when buildings are on the same campus", async () => {
    const result = await ShuttleDirectionsBuilder.buildShuttleRoute(
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      sgwBuilding,
      sgwBuilding,
    );

    expect(result).toBeNull();
    expect(mockGetSchedule).not.toHaveBeenCalled();
  });

  it("returns null when shuttle has no service", async () => {
    mockGetSchedule.mockResolvedValue({
      ...mockSchedule,
      no_service: true,
    });
    mockGetRoute.mockResolvedValue(mockShuttleRoute);

    const result = await ShuttleDirectionsBuilder.buildShuttleRoute(
      loyBuilding.latitude,
      loyBuilding.longitude,
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      loyBuilding,
      sgwBuilding,
    );

    expect(result).toBeNull();
  });

  it("returns null when no departures available after current time", async () => {
    // Set time after last departure
    jest.setSystemTime(new Date(2026, 2, 2, 19, 0, 0));

    mockGetSchedule.mockResolvedValue(mockSchedule);
    mockGetRoute.mockResolvedValue(mockShuttleRoute);

    const result = await ShuttleDirectionsBuilder.buildShuttleRoute(
      loyBuilding.latitude,
      loyBuilding.longitude,
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      loyBuilding,
      sgwBuilding,
    );

    expect(result).toBeNull();
  });

  it("uses loyola_to_sgw route when origin is LOY", async () => {
    mockGetSchedule.mockResolvedValue(mockSchedule);
    mockGetRoute.mockResolvedValue(mockShuttleRoute);
    mockFetchDirections.mockResolvedValue(mockWalkRoute);

    const result = await ShuttleDirectionsBuilder.buildShuttleRoute(
      loyBuilding.latitude,
      loyBuilding.longitude,
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      loyBuilding,
      sgwBuilding,
    );

    expect(result).not.toBeNull();
    const shuttleStep = result!.steps.find(
      (s) => s.transitDetails?.vehicleName === "Concordia Shuttle",
    );
    expect(shuttleStep!.transitDetails!.departureStopName).toBe(
      "Loyola Campus",
    );
    expect(shuttleStep!.transitDetails!.arrivalStopName).toBe(
      "SGW (Hall Building)",
    );
  });

  it("handles null walking directions gracefully", async () => {
    mockGetSchedule.mockResolvedValue(mockSchedule);
    mockGetRoute.mockResolvedValue(mockShuttleRoute);
    mockFetchDirections.mockResolvedValue(null);

    const result = await ShuttleDirectionsBuilder.buildShuttleRoute(
      loyBuilding.latitude,
      loyBuilding.longitude,
      sgwBuilding.latitude,
      sgwBuilding.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      loyBuilding,
      sgwBuilding,
    );

    // Should still return a route with just the shuttle leg
    expect(result).not.toBeNull();
    expect(result!.steps.length).toBeGreaterThanOrEqual(1);
    const shuttleStep = result!.steps.find(
      (s) => s.transitDetails?.vehicleName === "Concordia Shuttle",
    );
    expect(shuttleStep).toBeDefined();
  });
});
