import {
  fetchDirections,
  getAllTravelTimes,
  isCrossCampus,
  normalizeCampus,
} from "../../src/services/GoogleDirectionsService";

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

const origin = { latitude: 45.497, longitude: -73.579 };
const destination = { latitude: 45.458, longitude: -73.64 };

const makeRouteResponse = (overrides: Record<string, any> = {}) => ({
  routes: [
    {
      legs: [
        {
          duration: { value: 600 },
          distance: { value: 1500 },
        },
      ],
      overview_polyline: { points: "_p~iF~ps|U_ulLnnqC" },
      ...overrides,
    },
  ],
});

describe("fetchDirections", () => {
  it("returns parsed directions on a successful response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeRouteResponse(),
    });

    const result = await fetchDirections(origin, destination, "walking");

    expect(result).toEqual({
      durationMinutes: 10,
      distanceMeters: 1500,
      polyline: "_p~iF~ps|U_ulLnnqC",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("origin=45.497,-73.579"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("destination=45.458,-73.64"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("mode=walking"),
    );
  });

  it("rounds duration to nearest minute", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        routes: [
          {
            legs: [{ duration: { value: 150 }, distance: { value: 800 } }],
            overview_polyline: { points: "abc" },
          },
        ],
      }),
    });

    const result = await fetchDirections(origin, destination, "driving");

    // 150 / 60 = 2.5 → rounds to 3
    expect(result.durationMinutes).toBe(3);
  });

  it("throws when no routes are returned", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ routes: [] }),
    });

    await expect(
      fetchDirections(origin, destination, "transit"),
    ).rejects.toThrow("No route found");
  });

  it("throws when routes is undefined", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await expect(
      fetchDirections(origin, destination, "bicycling"),
    ).rejects.toThrow("No route found");
  });

  it("returns empty polyline when overview_polyline is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        routes: [
          {
            legs: [{ duration: { value: 300 }, distance: { value: 1000 } }],
          },
        ],
      }),
    });

    const result = await fetchDirections(origin, destination, "walking");

    expect(result.polyline).toBe("");
    expect(result.durationMinutes).toBe(5);
    expect(result.distanceMeters).toBe(1000);
  });
});

describe("normalizeCampus", () => {
  it('returns "LOY" for "LOY"', () => {
    expect(normalizeCampus("LOY")).toBe("LOY");
  });

  it('returns "LOY" for "LOYOLA"', () => {
    expect(normalizeCampus("LOYOLA")).toBe("LOY");
  });

  it('returns "LOY" for lowercase "loyola"', () => {
    expect(normalizeCampus("loyola")).toBe("LOY");
  });

  it('returns "LOY" for mixed case "Loy"', () => {
    expect(normalizeCampus("Loy")).toBe("LOY");
  });

  it('returns "SGW" for "SGW"', () => {
    expect(normalizeCampus("SGW")).toBe("SGW");
  });

  it('returns "SGW" for any unrecognized string', () => {
    expect(normalizeCampus("downtown")).toBe("SGW");
    expect(normalizeCampus("")).toBe("SGW");
  });
});

describe("isCrossCampus", () => {
  it("returns true when campuses differ", () => {
    expect(isCrossCampus("SGW", "LOY")).toBe(true);
    expect(isCrossCampus("SGW", "LOYOLA")).toBe(true);
  });

  it("returns false when campuses are the same", () => {
    expect(isCrossCampus("SGW", "SGW")).toBe(false);
    expect(isCrossCampus("LOY", "LOYOLA")).toBe(false);
  });
});

describe("getAllTravelTimes", () => {
  it("returns all four travel modes", async () => {
    const makeResult = (duration: number) => ({
      routes: [
        {
          legs: [{ duration: { value: duration }, distance: { value: 1000 } }],
          overview_polyline: { points: "poly" },
        },
      ],
    });

    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => makeResult(300) })
      .mockResolvedValueOnce({ ok: true, json: async () => makeResult(240) })
      .mockResolvedValueOnce({ ok: true, json: async () => makeResult(600) })
      .mockResolvedValueOnce({ ok: true, json: async () => makeResult(180) });

    const result = await getAllTravelTimes(origin, destination);

    expect(result.walk.durationMinutes).toBe(5);
    expect(result.bike.durationMinutes).toBe(4);
    expect(result.transit.durationMinutes).toBe(10);
    expect(result.drive.durationMinutes).toBe(3);
    expect(mockFetch).toHaveBeenCalledTimes(4);
  });

  it("rejects if any mode fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeRouteResponse(),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeRouteResponse(),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => makeRouteResponse(),
      });

    await expect(getAllTravelTimes(origin, destination)).rejects.toThrow(
      "No route found",
    );
  });
});
