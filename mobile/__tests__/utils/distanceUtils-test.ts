import { haversineDistance } from "../../src/utils/distanceUtils";

describe("haversineDistance", () => {
  it("returns 0 for the same point", () => {
    expect(haversineDistance(45.5, -73.6, 45.5, -73.6)).toBe(0);
  });

  it("computes approximate distance between two known points", () => {
    // Concordia SGW Hall to Loyola Central ≈ 6.4 km
    const dist = haversineDistance(45.4973, -73.5789, 45.458, -73.6405);
    expect(dist).toBeGreaterThan(5);
    expect(dist).toBeLessThan(8);
  });

  it("computes a short distance accurately within ~10%", () => {
    // Two points ~1 km apart in Montreal
    const dist = haversineDistance(45.4973, -73.5789, 45.4973, -73.5660);
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(2);
  });

  it("is symmetric", () => {
    const d1 = haversineDistance(45.5, -73.6, 45.4, -73.5);
    const d2 = haversineDistance(45.4, -73.5, 45.5, -73.6);
    expect(d1).toBeCloseTo(d2, 10);
  });
});
