import { getClosestCampusId } from "../../src/utils/campusDetection";

// Mock the buildingDetection module
jest.mock("../../src/utils/buildingDetection", () => ({
    calculateDistance: jest.fn((lat1: number, lon1: number, lat2: number, lon2: number) => {
        // Simple Euclidean-like distance for testing
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2)) * 111000;
    }),
}));

describe("getClosestCampusId", () => {
    test("returns SGW for coordinates near SGW campus", () => {
        // SGW campus is at approximately 45.4953, -73.5789
        const result = getClosestCampusId(45.4953, -73.5789);
        expect(result).toBe("SGW");
    });

    test("returns LOYOLA for coordinates near Loyola campus", () => {
        // Loyola campus is at approximately 45.4582, -73.6405
        const result = getClosestCampusId(45.4582, -73.6405);
        expect(result).toBe("LOYOLA");
    });

    test("returns LOYOLA for coordinates closer to Loyola", () => {
        // Point closer to Loyola (west Montreal)
        const result = getClosestCampusId(45.46, -73.65);
        expect(result).toBe("LOYOLA");
    });

    test("returns SGW for coordinates closer to SGW", () => {
        // Point closer to SGW (downtown)
        const result = getClosestCampusId(45.50, -73.57);
        expect(result).toBe("SGW");
    });

    test("handles edge case at midpoint", () => {
        // Midpoint between the two campuses - should return one of them
        const result = getClosestCampusId(45.4768, -73.6097);
        expect(["SGW", "LOYOLA"]).toContain(result);
    });
});
