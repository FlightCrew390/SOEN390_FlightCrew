import { renderHook, waitFor } from "@testing-library/react-native";
import { useDirections } from "../../src/hooks/useDirections";
import { DirectionsService } from "../../src/services/DirectionsService";
import { Building, StructureType } from "../../src/types/Building";
import {
  DEFAULT_DEPARTURE_CONFIG,
  RouteInfo,
} from "../../src/types/Directions";
import { ShuttleDirectionsBuilder } from "../../src/services/ShuttleDirectionsBuilder";
import { IndoorPathfindingService } from "../../src/services/IndoorPathfindingService";

jest.mock("../../src/services/DirectionsService");
jest.mock("../../src/services/ShuttleDirectionsBuilder");
jest.mock("../../src/services/IndoorPathfindingService");
jest.mock("../../src/services/IndoorDataService", () => {
  return {
    IndoorDataService: {
      ensureLoaded: jest.fn().mockResolvedValue(true),
      getAllNodes: jest.fn().mockReturnValue([
        { id: "exit1", buildingId: "B1", type: "entry_exit", floor: 1 },
        { id: "entry1", buildingId: "B2", type: "entry_exit", floor: 1 },
        { id: "room1", buildingId: "B1", type: "room", floor: 2 },
        { id: "synth_0", buildingId: "B1", type: "room", floor: 2 },
        { id: "room2", buildingId: "B2", type: "room", floor: 2 },
        { id: "synth_1", buildingId: "B2", type: "room", floor: 2 },
      ]),
    },
  };
});

const mockFetchDirections =
  DirectionsService.fetchDirections as jest.MockedFunction<
    typeof DirectionsService.fetchDirections
  >;

const destination: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
  structureType: StructureType.Building,
  accessibilityInfo:
    "Wheelchair accessible entrance at 1455 De Maisonneuve Blvd. W.",
};

const startBuilding: Building = {
  campus: "LOY",
  buildingCode: "AD",
  buildingName: "Administration Building",
  buildingLongName: "Loyola Administration Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.4582,
  longitude: -73.6405,
  structureType: StructureType.Building,
  accessibilityInfo: "Wheelchair accessible entrance at 7141 Sherbrooke St. W.",
};

const mockRoute: RouteInfo = {
  coordinates: [{ latitude: 45.497, longitude: -73.579 }],
  distanceMeters: 1000,
  durationSeconds: 300,
  steps: [],
};

const userLocation = { latitude: 45.5, longitude: -73.58 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useDirections", () => {
  it("does not fetch when not active", () => {
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: false,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).not.toHaveBeenCalled();
    expect(mockFetchDirections).not.toHaveBeenCalled();
  });

  it("does not fetch when destination is null", () => {
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination: null,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).not.toHaveBeenCalled();
    expect(mockFetchDirections).not.toHaveBeenCalled();
  });

  it("does not fetch when origin coordinates are unavailable", () => {
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation: null,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).not.toHaveBeenCalled();
    expect(mockFetchDirections).not.toHaveBeenCalled();
  });

  it("fetches directions using user location when no startBuilding", async () => {
    mockFetchDirections.mockResolvedValueOnce(mockRoute);
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).toHaveBeenCalled();

    await waitFor(() => expect(onLoaded).toHaveBeenCalledWith(mockRoute));
    expect(mockFetchDirections).toHaveBeenCalledWith(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude,
      "WALK",
      undefined,
      undefined,
    );
  });

  it("fetches directions using startBuilding when provided", async () => {
    mockFetchDirections.mockResolvedValueOnce(mockRoute);
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "DRIVE",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    expect(mockFetchDirections).toHaveBeenCalledWith(
      startBuilding.latitude,
      startBuilding.longitude,
      destination.latitude,
      destination.longitude,
      "DRIVE",
      undefined,
      undefined,
    );
  });

  it("calls onError with error message on Error instance", async () => {
    mockFetchDirections.mockRejectedValueOnce(new Error("Quota exceeded"));
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => expect(onError).toHaveBeenCalledWith("Quota exceeded"));
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("calls onError with fallback message on non-Error throw", async () => {
    mockFetchDirections.mockRejectedValueOnce("string error");
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Failed to load directions"),
    );
  });

  it("cancels in-flight request on unmount", async () => {
    let resolvePromise: (value: RouteInfo | null) => void;
    mockFetchDirections.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        }),
    );
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    const { unmount } = renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).toHaveBeenCalled();

    // Unmount to trigger cancellation
    unmount();

    // Resolve after unmount ΓÇö callbacks should NOT be called
    resolvePromise!(mockRoute);

    // Give the promise callback a tick to settle
    await new Promise((r) => setTimeout(r, 0));
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("fetches shuttle directions when travel mode is SHUTTLE", async () => {
    const mockShuttleRoute: RouteInfo = { ...mockRoute, distanceMeters: 555 };
    (
      ShuttleDirectionsBuilder.buildShuttleRoute as jest.Mock
    ).mockResolvedValueOnce(mockShuttleRoute);
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom: null,
        userLocation,
        travelMode: "SHUTTLE",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).toHaveBeenCalled();

    await waitFor(() =>
      expect(onLoaded).toHaveBeenCalledWith(mockShuttleRoute),
    );
    expect(ShuttleDirectionsBuilder.buildShuttleRoute).toHaveBeenCalledWith(
      userLocation.latitude,
      userLocation.longitude,
      destination.latitude,
      destination.longitude,
      DEFAULT_DEPARTURE_CONFIG,
      null,
      destination,
    );
  });

  it("handles indoor pathfinding failure for outdoor route gracefully (departure fallback)", async () => {
    const startRoom = { id: "room1", buildingId: "B1", floor: 2 } as any;
    const destRoom = null;
    mockFetchDirections.mockResolvedValueOnce(mockRoute);
    (IndoorPathfindingService.getDirections as jest.Mock).mockRejectedValueOnce(
      new Error("Graph error"),
    );
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: destRoom,
        startRoom,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    const finalRoute = onLoaded.mock.calls[0][0];
    expect(finalRoute.indoorPathOrigin).toBeDefined();
    expect(finalRoute.indoorPathOrigin.length).toBeGreaterThan(0);
  });

  it("handles empty path for outdoor route gracefully (arrival fallback)", async () => {
    const destRoom = { id: "room2", buildingId: "B2", floor: 2 } as any;
    mockFetchDirections.mockResolvedValueOnce(mockRoute);
    (IndoorPathfindingService.getDirections as jest.Mock).mockImplementation(
      async () => {
        return { path: [] } as any;
      },
    );
    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: destination,
        destinationRoom: destRoom,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    const finalRoute = onLoaded.mock.calls[0][0];
    expect(finalRoute.indoorPath).toBeDefined();
    expect(finalRoute.indoorPath.length).toBeGreaterThan(0);
  });

  it("fetches indoor pathfinding when startRoom and destinationRoom are in the same building", async () => {
    const startRoom = { id: "room1", buildingId: "B1", floor: 1 } as any;
    const destRoom = { id: "room2", buildingId: "B1", floor: 1 } as any;

    const mockIndoorRes = {
      distanceMeters: 100,
      durationSeconds: 120,
      steps: [
        {
          distanceMeters: 100,
          durationSeconds: 120,
          instruction: "Walk",
          maneuver: "straight",
        },
      ],
      path: [startRoom, destRoom],
    };
    (IndoorPathfindingService.getDirections as jest.Mock).mockResolvedValueOnce(
      mockIndoorRes,
    );

    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: destRoom,
        startRoom,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    expect(onLoading).toHaveBeenCalled();

    await waitFor(() =>
      expect(onLoaded).toHaveBeenCalledWith(
        expect.objectContaining({
          distanceMeters: 100,
          durationSeconds: 120,
          indoorPath: [startRoom, destRoom],
        }),
      ),
    );
  });

  it("calls onError if indoor pathfinding fails", async () => {
    const startRoom = { id: "room1", buildingId: "B1", floor: 1 } as any;
    const destRoom = { id: "room2", buildingId: "B1", floor: 1 } as any;

    (IndoorPathfindingService.getDirections as jest.Mock).mockRejectedValueOnce(
      new Error("Fail"),
    );

    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: destRoom,
        startRoom,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Could not compute indoor path."),
    );
    expect(onLoaded).not.toHaveBeenCalled();
  });

  it("handles fallback to building node when no entry/exit nodes found (departure)", async () => {
    const startRoom = {
      id: "room1",
      buildingId: "NO_EXIT_BLDG",
      floor: 2,
    } as any;

    mockFetchDirections.mockResolvedValueOnce(mockRoute);

    (IndoorPathfindingService.getDirections as jest.Mock).mockImplementation(
      async () => {
        return { distanceMeters: 10, durationSeconds: 10, steps: [], path: [] };
      },
    );

    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        destinationRoom: null,
        startRoom,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    const finalRoute = onLoaded.mock.calls[0][0];
    expect(finalRoute.indoorPathOrigin).toBeDefined();
  });

  it("handles fallback to building node when no entry/exit nodes found (arrival)", async () => {
    const destRoom = {
      id: "room2",
      buildingId: "NO_EXIT_BLDG",
      floor: 2,
    } as any;

    mockFetchDirections.mockResolvedValueOnce(mockRoute);

    (IndoorPathfindingService.getDirections as jest.Mock).mockImplementation(
      async () => {
        return { distanceMeters: 10, durationSeconds: 10, steps: [], path: [] };
      },
    );

    const onLoading = jest.fn();
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: destination,
        destinationRoom: destRoom,
        startRoom: null,
        userLocation,
        travelMode: "WALK",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading,
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => expect(onLoaded).toHaveBeenCalled());
    const finalRoute = onLoaded.mock.calls[0][0];
    expect(finalRoute.indoorPath).toBeDefined();
  });
});
