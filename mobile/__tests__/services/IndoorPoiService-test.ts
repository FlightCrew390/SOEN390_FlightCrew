import { getIndoorPoisForBuilding } from "../../src/services/IndoorPoiService";

describe("IndoorPoiService", () => {
  it("returns POIs for a known building", () => {
    const pois = getIndoorPoisForBuilding("H");
    expect(pois.length).toBeGreaterThan(0);
  });

  it("returns empty array for unknown building code", () => {
    const pois = getIndoorPoisForBuilding("UNKNOWN");
    expect(pois).toEqual([]);
  });

  it("returns all four categories for Hall building", () => {
    const pois = getIndoorPoisForBuilding("H");
    const categories = pois.map((p) => p.category);
    expect(categories).toContain("washroom");
    expect(categories).toContain("fountain");
    expect(categories).toContain("stairs");
    expect(categories).toContain("elevator");
  });

  it("returns POIs with all required fields populated", () => {
    const pois = getIndoorPoisForBuilding("H");
    pois.forEach((poi) => {
      expect(poi.id).toBeTruthy();
      expect(poi.name).toBeTruthy();
      expect(poi.buildingCode).toBe("H");
      expect(typeof poi.floor).toBe("number");
      expect(typeof poi.latitude).toBe("number");
      expect(typeof poi.longitude).toBe("number");
      expect(poi.description).toBeTruthy();
    });
  });

  it("returns POIs for MB building with all four categories", () => {
    const pois = getIndoorPoisForBuilding("MB");
    const categories = pois.map((p) => p.category);
    expect(categories).toContain("washroom");
    expect(categories).toContain("fountain");
    expect(categories).toContain("stairs");
    expect(categories).toContain("elevator");
  });

  it("returns POIs with correct buildingCode for each building", () => {
    ["H", "MB", "EV", "CC", "SP"].forEach((code) => {
      const pois = getIndoorPoisForBuilding(code);
      expect(pois.length).toBeGreaterThan(0);
      pois.forEach((poi) => expect(poi.buildingCode).toBe(code));
    });
  });

  it("returns unique ids across all POIs in a building", () => {
    const pois = getIndoorPoisForBuilding("H");
    const ids = pois.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
