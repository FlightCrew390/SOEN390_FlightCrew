import { getIndoorPoisForBuilding } from "../../src/services/IndoorPoiService";

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

  it("returns VE pois for VE building", () => {
    const pois = getIndoorPoisForBuilding("VE");
    expect(pois.length).toBeGreaterThan(0);
    pois.forEach((poi) => expect(poi.buildingCode).toBe("VE"));
  });

  it("returns VL pois for VL building", () => {
    const pois = getIndoorPoisForBuilding("VL");
    expect(pois.length).toBeGreaterThan(0);
    pois.forEach((poi) => expect(poi.buildingCode).toBe("VL"));
  });

  it("VL pois include elevator category", () => {
    const pois = getIndoorPoisForBuilding("VL");
    const categories = pois.map((p) => p.category);
    expect(categories).toContain("elevator");
  });

  it("Hall pois cover floors 2, 8, and 9", () => {
    const pois = getIndoorPoisForBuilding("H");
    const floors = new Set(pois.map((p) => p.floor));
    expect(floors).toContain(2);
    expect(floors).toContain(8);
    expect(floors).toContain(9);
  });

  it("Hall pois cover all floors 1 through 11", () => {
    const pois = getIndoorPoisForBuilding("H");
    const floors = new Set(pois.map((p) => p.floor));
    for (let f = 1; f <= 11; f++) {
      expect(floors).toContain(f);
    }
  });

  it("VE pois include all four amenity categories", () => {
    const pois = getIndoorPoisForBuilding("VE");
    const categories = pois.map((p) => p.category);
    expect(categories).toContain("washroom");
    expect(categories).toContain("fountain");
    expect(categories).toContain("stairs");
    expect(categories).toContain("elevator");
  });

  it("MB pois cover floors 1, 2, and 3", () => {
    const pois = getIndoorPoisForBuilding("MB");
    const floors = new Set(pois.map((p) => p.floor));
    expect(floors).toContain(1);
    expect(floors).toContain(2);
    expect(floors).toContain(3);
  });

  it("MB pois include all four amenity categories", () => {
    const pois = getIndoorPoisForBuilding("MB");
    const categories = pois.map((p) => p.category);
    expect(categories).toContain("washroom");
    expect(categories).toContain("fountain");
    expect(categories).toContain("stairs");
    expect(categories).toContain("elevator");
  });
});
