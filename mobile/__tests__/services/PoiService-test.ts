import { PoiService } from "../../src/services/PoiService";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockApiResponse = [
  {
    Name: "Café Gentile",
    Category: "cafe",
    Campus: "SGW",
    Address: "4126 Ste-Catherine St W, Montreal, QC",
    Latitude: 45.496,
    Longitude: -73.5795,
    Description: "Italian-style café",
    Google_Place_Info: { displayName: { text: "Café Gentile" } },
  },
  {
    Name: "La Belle & La Boeuf",
    Category: "restaurant",
    Campus: "SGW",
    Address: "1700 Ste-Catherine St W",
    Latitude: 45.495,
    Longitude: -73.578,
    Description: "Burger restaurant",
  },
];

describe("PoiService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and maps POIs correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const pois = await PoiService.fetchPois();

    expect(pois).toHaveLength(2);
    expect(pois[0]).toEqual({
      name: "Café Gentile",
      category: "cafe",
      campus: "SGW",
      address: "4126 Ste-Catherine St W, Montreal, QC",
      latitude: 45.496,
      longitude: -73.5795,
      description: "Italian-style café",
      googlePlaceInfo: { displayName: { text: "Café Gentile" } },
    });
    expect(pois[1].name).toBe("La Belle & La Boeuf");
    expect(pois[1].googlePlaceInfo).toBeUndefined();
  });

  it("appends campus query parameter when provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await PoiService.fetchPois("SGW");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/poi/list?campus=SGW"),
    );
  });

  it("does not append campus query parameter when not provided", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await PoiService.fetchPois();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/poi/list"),
    );
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining("campus="),
    );
  });

  it("throws on HTTP error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(PoiService.fetchPois()).rejects.toThrow("HTTP error! status: 500");
  });

  it("throws network error with helpful message", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Network request failed"));

    await expect(PoiService.fetchPois()).rejects.toThrow(
      "Cannot connect to server",
    );
  });
});
