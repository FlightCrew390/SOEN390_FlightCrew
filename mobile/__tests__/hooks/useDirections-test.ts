import { renderHook, waitFor } from "@testing-library/react-native";
import { useDirections } from "../../src/hooks/useDirections";
import { DirectionsService } from "../../src/services/DirectionsService";
import { ShuttleService } from "../../src/services/ShuttleService";
import { Building, StructureType } from "../../src/types/Building";
import { DEFAULT_DEPARTURE_CONFIG, RouteInfo } from "../../src/types/Directions";

jest.mock("../../src/services/DirectionsService");
jest.mock("../../src/services/ShuttleService");

const mockFetchDirections =
  DirectionsService.fetchDirections as jest.MockedFunction<
    typeof DirectionsService.fetchDirections
  >;
const mockGetRoute = ShuttleService.getRoute as jest.MockedFunction<
  typeof ShuttleService.getRoute
>;
const mockGetSchedule = ShuttleService.getSchedule as jest.MockedFunction<
  typeof ShuttleService.getSchedule
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
        userLocation,
        userCampus: null,
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
        userLocation,
        userCampus: null,
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
        userLocation: null,
        userCampus: null,
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
        userLocation,
        userCampus: null,
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
        userLocation,
        userCampus: null,
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
        userLocation,
        userCampus: null,
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
        userLocation,
        userCampus: null,
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
        userLocation,
        userCampus: null,
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

    // Resolve after unmount — callbacks should NOT be called
    resolvePromise!(mockRoute);

    // Give the promise callback a tick to settle
    await new Promise((r) => setTimeout(r, 0));
    expect(onLoaded).not.toHaveBeenCalled();
  });
});

describe("useDirections SHUTTLE", () => {
  beforeEach(() => {
    mockGetRoute.mockReset();
    mockGetSchedule.mockReset();
  });

  it("does not fetch shuttle when userCampus is null", async () => {
    const onLoaded = jest.fn();
    const onError = jest.fn();

    renderHook(() =>
      useDirections({
        destination,
        startBuilding: null,
        userLocation,
        userCampus: null,
        travelMode: "SHUTTLE",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading: jest.fn(),
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => {});
    expect(mockGetRoute).not.toHaveBeenCalled();
    expect(mockGetSchedule).not.toHaveBeenCalled();
  });

  it("calls onLoaded(null) and onError when no upcoming departures", async () => {
    const onLoaded = jest.fn();
    const onError = jest.fn();
    mockGetRoute.mockResolvedValueOnce({
      duration: "21 mins",
      distance: "8.3 km",
      sgw_to_loyola: [{ latitude: 45.497, longitude: -73.578 }],
      loyola_to_sgw: [{ latitude: 45.458, longitude: -73.638 }],
    });
    mockGetSchedule.mockResolvedValueOnce({
      day: "TUESDAY",
      no_service: true,
      service_start: null,
      service_end: null,
      departures: [],
    });

    renderHook(() =>
      useDirections({
        destination: startBuilding,
        startBuilding: null,
        userLocation,
        userCampus: "SGW",
        travelMode: "SHUTTLE",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading: jest.fn(),
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => {
      expect(mockGetRoute).toHaveBeenCalled();
      expect(mockGetSchedule).toHaveBeenCalled();
      expect(onLoaded).toHaveBeenCalledWith(null);
      expect(onError).toHaveBeenCalledWith("No shuttle available");
    });
  });

  it("calls onLoaded(route) when schedule has upcoming departures", async () => {
    const onLoaded = jest.fn();
    const onError = jest.fn();
    // Use depart_at 08:00 so mock departures 09:30 and 10:30 count as upcoming
    const tuesday8am = new Date("2025-02-04T08:00:00");
    mockGetRoute.mockResolvedValueOnce({
      duration: "21 mins",
      distance: "8.3 km",
      sgw_to_loyola: [
        { latitude: 45.497, longitude: -73.578 },
        { latitude: 45.458, longitude: -73.638 },
      ],
      loyola_to_sgw: [
        { latitude: 45.458, longitude: -73.638 },
        { latitude: 45.497, longitude: -73.578 },
      ],
    });
    mockGetSchedule.mockResolvedValueOnce({
      day: "TUESDAY",
      no_service: false,
      service_start: "09:15",
      service_end: "18:30",
      departures: [
        {
          loyola_departure: "09:15",
          sgw_departure: "09:30",
          last_bus: false,
        },
        {
          loyola_departure: "10:15",
          sgw_departure: "10:30",
          last_bus: false,
        },
      ],
    });

    renderHook(() =>
      useDirections({
        destination: startBuilding,
        startBuilding: null,
        userLocation,
        userCampus: "SGW",
        travelMode: "SHUTTLE",
        departureConfig: { option: "depart_at", date: tuesday8am },
        active: true,
        onLoading: jest.fn(),
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => {
      expect(onLoaded).toHaveBeenCalled();
      const route = onLoaded.mock.calls[0][0] as RouteInfo;
      expect(route).not.toBeNull();
      expect(route.steps.length).toBeGreaterThan(0);
      expect(route.durationText).toBe("21 mins");
      expect(route.coordinates.length).toBe(2);
    });
  });

  it("calls onError when getRoute fails", async () => {
    const onLoaded = jest.fn();
    const onError = jest.fn();
    mockGetRoute.mockRejectedValueOnce(new Error("Network error"));

    renderHook(() =>
      useDirections({
        destination: startBuilding,
        startBuilding: null,
        userLocation,
        userCampus: "SGW",
        travelMode: "SHUTTLE",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading: jest.fn(),
        onLoaded,
        onError,
      }),
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Network error");
      expect(onLoaded).not.toHaveBeenCalled();
    });
  });

  it("calls onError with generic message when getRoute throws non-Error", async () => {
    const onError = jest.fn();
    mockGetRoute.mockRejectedValueOnce("string error");

    renderHook(() =>
      useDirections({
        destination: startBuilding,
        startBuilding: null,
        userLocation,
        userCampus: "SGW",
        travelMode: "SHUTTLE",
        departureConfig: DEFAULT_DEPARTURE_CONFIG,
        active: true,
        onLoading: jest.fn(),
        onLoaded: jest.fn(),
        onError,
      }),
    );

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Failed to load shuttle route");
    });
  });
});
