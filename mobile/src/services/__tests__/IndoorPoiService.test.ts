import { getIndoorPoisForBuilding } from "../IndoorPoiService";

describe("getIndoorPoisForBuilding", () => {
  it("returns pois for a known building code", () => {
    const pois = getIndoorPoisForBuilding("H");
    expect(pois.length).toBeGreaterThan(0);
    pois.forEach((poi) => expect(poi.buildingCode).toBe("H"));
  });

  it("is case-insensitive", () => {
    const lower = getIndoorPoisForBuilding("h");
    const upper = getIndoorPoisForBuilding("H");
    expect(lower).toEqual(upper);
  });

  it("returns empty array for unknown building code", () => {
    expect(getIndoorPoisForBuilding("ZZ")).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(getIndoorPoisForBuilding("")).toEqual([]);
  });

  it("returns empty array for whitespace-only string", () => {
    expect(getIndoorPoisForBuilding("   ")).toEqual([]);
  });

  it("returns MB pois for MB building", () => {
    const pois = getIndoorPoisForBuilding("MB");
    expect(pois.length).toBeGreaterThan(0);
    pois.forEach((poi) => expect(poi.buildingCode).toBe("MB"));
  });

  it("returned pois for Hall include washroom and fountain categories", () => {
    const pois = getIndoorPoisForBuilding("H");
    const categories = pois.map((p) => p.category);
    expect(categories).toContain("washroom");
    expect(categories).toContain("fountain");
  });
});
