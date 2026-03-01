import { renderHook, waitFor } from "@testing-library/react-native";
import { useDirections } from "../../src/hooks/useDirections";
import { DirectionsService } from "../../src/services/DirectionsService";
import { Building } from "../../src/types/Building";
import { RouteInfo } from "../../src/types/Directions";

jest.mock("../../src/services/DirectionsService");

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
};

const startBuilding: Building = {
  campus: "LOY",
  buildingCode: "AD",
  buildingName: "Administration Building",
  buildingLongName: "Loyola Administration Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.4582,
  longitude: -73.6405,
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
        travelMode: "WALK",
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
        travelMode: "WALK",
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
        travelMode: "WALK",
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
        travelMode: "WALK",
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
        travelMode: "DRIVE",
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
        travelMode: "WALK",
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
        travelMode: "WALK",
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
        travelMode: "WALK",
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
