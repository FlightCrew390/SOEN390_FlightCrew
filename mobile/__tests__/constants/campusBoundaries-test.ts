import { campusBoundary, CampusBoundary, Coordinate } from "../../src/constants/campusBoundaries";

describe("campusBoundaries", () => {
    it("should export campusBoundary with northEast and southWest coordinates", () => {
        expect(campusBoundary).toHaveProperty("northEast");
        expect(campusBoundary).toHaveProperty("southWest");
    });

    it("should have valid coordinate structure for northEast", () => {
        expect(campusBoundary.northEast).toHaveProperty("latitude");
        expect(campusBoundary.northEast).toHaveProperty("longitude");
        expect(typeof campusBoundary.northEast.latitude).toBe("number");
        expect(typeof campusBoundary.northEast.longitude).toBe("number");
    });

    it("should have valid coordinate structure for southWest", () => {
        expect(campusBoundary.southWest).toHaveProperty("latitude");
        expect(campusBoundary.southWest).toHaveProperty("longitude");
        expect(typeof campusBoundary.southWest.latitude).toBe("number");
        expect(typeof campusBoundary.southWest.longitude).toBe("number");
    });
});
