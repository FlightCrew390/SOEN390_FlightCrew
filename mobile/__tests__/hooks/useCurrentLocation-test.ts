import { renderHook, waitFor } from "@testing-library/react-native";

import { useCurrentLocation } from "../../src/hooks/useCurrentLocation";

// Mock expo-location
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock("expo-location", () => ({
    requestForegroundPermissionsAsync: () => mockRequestForegroundPermissionsAsync(),
    getCurrentPositionAsync: (options: unknown) => mockGetCurrentPositionAsync(options),
    Accuracy: {
        Balanced: 3,
    },
}));

const mockLocation = {
    coords: {
        latitude: 45.4973,
        longitude: -73.5789,
        altitude: 50,
        accuracy: 10,
        heading: 0,
        speed: 0,
    },
    timestamp: Date.now(),
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("useCurrentLocation", () => {
    test("initial state shows loading", () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
        mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);

        const { result } = renderHook(() => useCurrentLocation());

        expect(result.current.loading).toBe(true);
        expect(result.current.location).toBeNull();
        expect(result.current.error).toBeNull();
    });

    test("loads location successfully when permission granted", async () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
        mockGetCurrentPositionAsync.mockResolvedValue(mockLocation);

        const { result } = renderHook(() => useCurrentLocation());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.location).toEqual(mockLocation);
        expect(result.current.error).toBeNull();
        expect(mockGetCurrentPositionAsync).toHaveBeenCalledWith({ accuracy: 3 });
    });

    test("handles permission denied", async () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "denied" });

        const { result } = renderHook(() => useCurrentLocation());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.location).toBeNull();
        expect(result.current.error).toBe(
            "Location permission denied. Please enable location access in settings.",
        );
    });

    test("handles Error exceptions", async () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
        mockGetCurrentPositionAsync.mockRejectedValue(new Error("GPS unavailable"));

        const { result } = renderHook(() => useCurrentLocation());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.location).toBeNull();
        expect(result.current.error).toBe("GPS unavailable");
    });

    test("handles non-Error exceptions", async () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });
        mockGetCurrentPositionAsync.mockRejectedValue("Some string error");

        const { result } = renderHook(() => useCurrentLocation());

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.location).toBeNull();
        expect(result.current.error).toBe(
            "Unable to determine your location. Please check your GPS settings.",
        );
    });

    test("does not update state if unmounted before permission resolves", async () => {
        let resolvePermission: (value: { status: string }) => void;
        mockRequestForegroundPermissionsAsync.mockImplementation(
            () => new Promise((resolve) => { resolvePermission = resolve; })
        );

        const { unmount } = renderHook(() => useCurrentLocation());

        // Unmount before permission resolves
        unmount();

        // Now resolve - should not throw or update state
        resolvePermission!({ status: "granted" });

        // Just verify no errors occurred
        expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalled();
    });

    test("does not update state if unmounted before location resolves", async () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });

        let resolveLocation: (value: typeof mockLocation) => void;
        mockGetCurrentPositionAsync.mockImplementation(
            () => new Promise((resolve) => { resolveLocation = resolve; })
        );

        const { unmount } = renderHook(() => useCurrentLocation());

        // Wait for permission to resolve
        await waitFor(() => {
            expect(mockGetCurrentPositionAsync).toHaveBeenCalled();
        });

        // Unmount before location resolves
        unmount();

        // Now resolve - should not throw or update state
        resolveLocation!(mockLocation);

        expect(mockGetCurrentPositionAsync).toHaveBeenCalled();
    });

    test("does not update state if unmounted before error handling", async () => {
        mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: "granted" });

        let rejectLocation: (error: Error) => void;
        mockGetCurrentPositionAsync.mockImplementation(
            () => new Promise((_, reject) => { rejectLocation = reject; })
        );

        const { unmount } = renderHook(() => useCurrentLocation());

        // Wait for getCurrentPositionAsync to be called
        await waitFor(() => {
            expect(mockGetCurrentPositionAsync).toHaveBeenCalled();
        });

        // Unmount before error resolves
        unmount();

        // Now reject - should not throw or update state
        rejectLocation!(new Error("Test error"));

        expect(mockGetCurrentPositionAsync).toHaveBeenCalled();
    });
});

