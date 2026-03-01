import { act, renderHook } from "@testing-library/react-native";
import { Platform } from "react-native";
import { useMapCamera } from "../../src/hooks/useMapCamera";
import { makeRoute } from "../fixtures";

// Mock campus boundaries
jest.mock("../../src/constants/campusBoundaries", () => ({
  campusBoundary: {
    northEast: { latitude: 45.52, longitude: -73.55 },
    southWest: { latitude: 45.45, longitude: -73.66 },
  },
}));

// Mock requestIdleCallback
globalThis.requestIdleCallback = ((cb: () => void) => setTimeout(cb, 0)) as any;

const mockAnimateToRegion = jest.fn();
const mockSetMapBoundaries = jest.fn();
const mockFitToCoordinates = jest.fn();

function makeMockMapRef(current: any = null) {
  return {
    current:
      current === null
        ? null
        : {
            animateToRegion: mockAnimateToRegion,
            setMapBoundaries: mockSetMapBoundaries,
            fitToCoordinates: mockFitToCoordinates,
            ...current,
          },
  };
}

const mockLocation = {
  coords: { latitude: 45.4973, longitude: -73.5789 },
};

describe("useMapCamera", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── handleMapReady ──

  describe("handleMapReady", () => {
    it("does nothing on iOS", () => {
      const mapRef = makeMockMapRef({});
      renderHook(() => useMapCamera(mapRef as any, null, null, "none"));
      // handleMapReady is returned but Platform.OS is ios so setMapBoundaries not called
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );
      act(() => {
        result.current.handleMapReady();
      });
      expect(mockSetMapBoundaries).not.toHaveBeenCalled();
    });

    it("sets boundaries on Android", () => {
      const originalOS = Platform.OS;
      Platform.OS = "android" as typeof Platform.OS;

      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );
      act(() => {
        result.current.handleMapReady();
      });
      expect(mockSetMapBoundaries).toHaveBeenCalledWith(
        { latitude: 45.52, longitude: -73.55 },
        { latitude: 45.45, longitude: -73.66 },
      );

      // Reset
      Platform.OS = originalOS;
    });
  });

  // ── handleRegionChangeComplete ──

  describe("handleRegionChangeComplete", () => {
    it("does nothing when region is within boundaries", () => {
      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRegionChangeComplete({
          latitude: 45.49,
          longitude: -73.58,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockAnimateToRegion).not.toHaveBeenCalled();
    });

    it("corrects when latitude exceeds north boundary", () => {
      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRegionChangeComplete({
          latitude: 45.53, // exceeds northEast.latitude of 45.52
          longitude: -73.58,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: 45.52 }),
        300,
      );
    });

    it("corrects when latitude is below south boundary", () => {
      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRegionChangeComplete({
          latitude: 45.44, // below southWest.latitude of 45.45
          longitude: -73.58,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ latitude: 45.45 }),
        300,
      );
    });

    it("corrects when longitude exceeds east boundary", () => {
      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRegionChangeComplete({
          latitude: 45.49,
          longitude: -73.54, // exceeds northEast.longitude of -73.55
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ longitude: -73.55 }),
        300,
      );
    });

    it("corrects when longitude is below west boundary", () => {
      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRegionChangeComplete({
          latitude: 45.49,
          longitude: -73.67, // below southWest.longitude of -73.66
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({ longitude: -73.66 }),
        300,
      );
    });

    it("does nothing when mapRef.current is null", () => {
      const mapRef = makeMockMapRef(null);
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRegionChangeComplete({
          latitude: 45.53,
          longitude: -73.58,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      });

      expect(mockAnimateToRegion).not.toHaveBeenCalled();
    });
  });

  // ── animateToBuilding ──

  describe("animateToBuilding", () => {
    it("animates to the building coordinates", () => {
      const mapRef = makeMockMapRef({});
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.animateToBuilding({
          latitude: 45.4973,
          longitude: -73.5789,
          buildingCode: "H",
        } as any);
      });

      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        {
          latitude: 45.4973,
          longitude: -73.5789,
          latitudeDelta: 0.003,
          longitudeDelta: 0.003,
        },
        800,
      );
    });

    it("does nothing when mapRef.current is null", () => {
      const mapRef = makeMockMapRef(null);
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.animateToBuilding({
          latitude: 45.4973,
          longitude: -73.5789,
        } as any);
      });

      expect(mockAnimateToRegion).not.toHaveBeenCalled();
    });
  });

  // ── handleRecenter ──

  describe("handleRecenter", () => {
    it("animates to user location and calls callback", () => {
      const mapRef = makeMockMapRef({});
      const onRecenter = jest.fn();
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, mockLocation as any, null, "none"),
      );

      act(() => {
        result.current.handleRecenter(onRecenter);
      });
      // flush requestIdleCallback
      act(() => {
        jest.runAllTimers();
      });

      expect(onRecenter).toHaveBeenCalledTimes(1);
      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 45.4973,
          longitude: -73.5789,
        }),
        1000,
      );
    });

    it("does nothing when location is null", () => {
      const mapRef = makeMockMapRef({});
      const onRecenter = jest.fn();
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, null, null, "none"),
      );

      act(() => {
        result.current.handleRecenter(onRecenter);
      });

      expect(onRecenter).not.toHaveBeenCalled();
      expect(mockAnimateToRegion).not.toHaveBeenCalled();
    });

    it("does nothing when mapRef.current is null", () => {
      const mapRef = makeMockMapRef(null);
      const onRecenter = jest.fn();
      const { result } = renderHook(() =>
        useMapCamera(mapRef as any, mockLocation as any, null, "none"),
      );

      act(() => {
        result.current.handleRecenter(onRecenter);
      });

      expect(onRecenter).not.toHaveBeenCalled();
    });
  });

  // ── Fit-to-route effect ──

  describe("fit-to-route effect", () => {
    it("calls fitToCoordinates when route is provided", () => {
      const mapRef = makeMockMapRef({});
      const route = makeRoute();

      renderHook(() => useMapCamera(mapRef as any, null, route, "none"));

      expect(mockFitToCoordinates).toHaveBeenCalledWith(
        route.coordinates,
        expect.objectContaining({
          edgePadding: { top: 200, right: 60, bottom: 300, left: 60 },
          animated: true,
        }),
      );
    });

    it("uses steps padding for steps panel", () => {
      const mapRef = makeMockMapRef({});
      const route = makeRoute();

      renderHook(() => useMapCamera(mapRef as any, null, route, "steps"));

      expect(mockFitToCoordinates).toHaveBeenCalledWith(
        route.coordinates,
        expect.objectContaining({
          edgePadding: { top: 250, right: 50, bottom: 50, left: 50 },
        }),
      );
    });

    it("uses directions padding for directions panel", () => {
      const mapRef = makeMockMapRef({});
      const route = makeRoute();

      renderHook(() => useMapCamera(mapRef as any, null, route, "directions"));

      expect(mockFitToCoordinates).toHaveBeenCalledWith(
        route.coordinates,
        expect.objectContaining({
          edgePadding: { top: 380, right: 0, bottom: 80, left: 0 },
        }),
      );
    });

    it("does not fit when route is null", () => {
      const mapRef = makeMockMapRef({});

      renderHook(() => useMapCamera(mapRef as any, null, null, "none"));

      expect(mockFitToCoordinates).not.toHaveBeenCalled();
    });

    it("does not fit when route has fewer than 2 coordinates", () => {
      const mapRef = makeMockMapRef({});
      const route = makeRoute({
        coordinates: [{ latitude: 45.49, longitude: -73.57 }],
      });

      renderHook(() => useMapCamera(mapRef as any, null, route, "none"));

      expect(mockFitToCoordinates).not.toHaveBeenCalled();
    });
  });

  // ── Center-on-user-once effect ──

  describe("center-on-user-once", () => {
    it("animates to user location on first render with location", () => {
      const mapRef = makeMockMapRef({});

      renderHook(() =>
        useMapCamera(mapRef as any, mockLocation as any, null, "none"),
      );

      act(() => {
        jest.runAllTimers();
      });

      expect(mockAnimateToRegion).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 45.4973,
          longitude: -73.5789,
        }),
        1000,
      );
    });

    it("does not re-center when location updates a second time", () => {
      const mapRef = makeMockMapRef({});
      const location1 = { coords: { latitude: 45.4973, longitude: -73.5789 } };
      const location2 = { coords: { latitude: 45.498, longitude: -73.58 } };

      const { rerender } = renderHook(
        ({ loc }: { loc: any }) =>
          useMapCamera(mapRef as any, loc, null, "none"),
        { initialProps: { loc: location1 } },
      );

      act(() => {
        jest.runAllTimers();
      });
      mockAnimateToRegion.mockClear();

      rerender({ loc: location2 });
      act(() => {
        jest.runAllTimers();
      });

      // Should NOT have been called again (once-only behavior)
      expect(mockAnimateToRegion).not.toHaveBeenCalled();
    });
  });
});
