import { getIndoorPoisForBuilding } from "../../src/services/IndoorPoiService";

// Mock fetch globally
globalThis.fetch = jest.fn();

describe("getIndoorPoisForBuilding", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns pois for a known building code", async () => {
    const mockPois = [
      {
        id: "H-washroom-1",
        name: "Washroom",
        category: "washroom",
        buildingCode: "H",
        floor: 1,
        latitude: 45.497,
        longitude: -73.579,
        description: "Test",
      },
    ];
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPois,
    });

    const pois = await getIndoorPoisForBuilding("H");
    expect(pois.length).toBeGreaterThan(0);
    pois.forEach((poi) => expect(poi.buildingCode).toBe("H"));
  });

  it("is case-insensitive", async () => {
    const mockPois = [
      {
        id: "H-washroom-1",
        name: "Washroom",
        category: "washroom",
        buildingCode: "H",
        floor: 1,
        latitude: 45.497,
        longitude: -73.579,
        description: "Test",
      },
    ];
    (globalThis.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockPois,
    });

    const lower = await getIndoorPoisForBuilding("h");
    const upper = await getIndoorPoisForBuilding("H");
    expect(lower).toEqual(upper);
  });

  it("returns empty array for unknown building code", async () => {
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    const pois = await getIndoorPoisForBuilding("ZZ");
    expect(pois).toEqual([]);
  });

  it("returns empty array for empty string", async () => {
    const pois = await getIndoorPoisForBuilding("");
    expect(pois).toEqual([]);
  });

  it("returns empty array for whitespace-only string", async () => {
    const pois = await getIndoorPoisForBuilding("   ");
    expect(pois).toEqual([]);
  });

  it("returns MB pois for MB building", async () => {
    const mockPois = [
      {
        id: "MB-washroom-1",
        name: "Washroom",
        category: "washroom",
        buildingCode: "MB",
        floor: 1,
        latitude: 45.496,
        longitude: -73.579,
        description: "Test",
      },
    ];
    (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPois,
    });

    const pois = await getIndoorPoisForBuilding("MB");
    expect(pois.length).toBeGreaterThan(0);
    pois.forEach((poi) => expect(poi.buildingCode).toBe("MB"));
  });

  it("handles fetch errors gracefully", async () => {
    (globalThis.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const pois = await getIndoorPoisForBuilding("H");
    expect(pois).toEqual([]);
  });
});
