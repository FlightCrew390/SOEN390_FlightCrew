import { decodePolyline } from "../../src/utils/polylineDecode";

describe("decodePolyline", () => {
  it("returns empty array for empty string", () => {
    expect(decodePolyline("")).toEqual([]);
  });

  it("decodes a single point", () => {
    // Encoded polyline for a single point near (38.5, -120.2)
    const encoded = "_p~iF~ps|U";
    const points = decodePolyline(encoded);
    expect(points).toHaveLength(1);
    expect(points[0].latitude).toBeCloseTo(38.5, 1);
    expect(points[0].longitude).toBeCloseTo(-120.2, 1);
  });

  it("decodes a multi-point polyline", () => {
    // Standard Google example: (38.5,-120.2), (40.7,-120.95), (43.252,-126.453)
    const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    const points = decodePolyline(encoded);
    expect(points).toHaveLength(3);

    expect(points[0].latitude).toBeCloseTo(38.5, 1);
    expect(points[0].longitude).toBeCloseTo(-120.2, 1);

    expect(points[1].latitude).toBeCloseTo(40.7, 1);
    expect(points[1].longitude).toBeCloseTo(-120.95, 1);

    expect(points[2].latitude).toBeCloseTo(43.252, 1);
    expect(points[2].longitude).toBeCloseTo(-126.453, 1);
  });

  it("returns objects with latitude and longitude keys", () => {
    const encoded = "_p~iF~ps|U";
    const points = decodePolyline(encoded);
    expect(points[0]).toHaveProperty("latitude");
    expect(points[0]).toHaveProperty("longitude");
  });

  it("handles negative coordinate deltas correctly", () => {
    // The Google example demonstrates negative deltas between successive points
    const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    const points = decodePolyline(encoded);
    // Second point longitude is more negative than first
    expect(points[1].longitude).toBeLessThan(points[0].longitude);
  });

  it("handles polyline with two points", () => {
    const encoded = "_p~iF~ps|U_ulLnnqC";
    const points = decodePolyline(encoded);
    expect(points).toHaveLength(2);
    expect(points[0].latitude).toBeCloseTo(38.5, 1);
    expect(points[1].latitude).toBeCloseTo(40.7, 1);
  });
});
