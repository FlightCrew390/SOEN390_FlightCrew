import { DirectionsService } from "../../src/services/DirectionsService";

// Mock fetch globally
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const createDirectionsResponse = (overrides: Record<string, any> = {}) => ({
  routes: [
    {
      polyline: { encodedPolyline: "_p~iF~ps|U_ulLnnqC" },
      distanceMeters: 1500,
      duration: "600s",
      legs: [
        {
          distanceMeters: 1500,
          duration: "600s",
          steps: [
            {
              distanceMeters: 500,
              staticDuration: "200s",
              polyline: { encodedPolyline: "_p~iF~ps|U" },
              navigationInstruction: {
                instructions: "Head north",
                maneuver: "DEPART",
              },
            },
            {
              distanceMeters: 1000,
              staticDuration: "400s",
              polyline: { encodedPolyline: "_ulLnnqC" },
              navigationInstruction: {
                instructions: "Turn left",
                maneuver: "TURN_LEFT",
              },
            },
          ],
        },
      ],
      ...overrides,
    },
  ],
});

describe("DirectionsService.fetchDirections", () => {
  it("returns parsed route on successful response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => createDirectionsResponse(),
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
      "WALK",
    );

    expect(result).not.toBeNull();
    expect(result!.distanceMeters).toBe(1500);
    expect(result!.durationSeconds).toBe(600);
    expect(result!.coordinates.length).toBeGreaterThan(0);
    expect(result!.steps).toHaveLength(2);
    expect(result!.steps[0].instruction).toBe("Head north");
    expect(result!.steps[1].instruction).toBe("Turn left");
  });

  it("returns null on 204 response (no route)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result).toBeNull();
  });

  it("throws on 429 quota exceeded", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
    });

    await expect(
      DirectionsService.fetchDirections(45.497, -73.579, 45.458, -73.64),
    ).rejects.toThrow("Directions quota exceeded. Please try again later.");
  });

  it("throws on non-ok HTTP response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      DirectionsService.fetchDirections(45.497, -73.579, 45.458, -73.64),
    ).rejects.toThrow("Directions request failed: 500");
  });

  it("throws on network error", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Network request failed"));

    await expect(
      DirectionsService.fetchDirections(45.497, -73.579, 45.458, -73.64),
    ).rejects.toThrow("Network request failed");
  });

  it("defaults travelMode to WALK", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => createDirectionsResponse(),
    });

    await DirectionsService.fetchDirections(45.497, -73.579, 45.458, -73.64);

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("travelMode=WALK");
  });

  it("passes DRIVE travel mode in URL params", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => createDirectionsResponse(),
    });

    await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
      "DRIVE",
    );

    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("travelMode=DRIVE");
  });

  it("returns null when response has empty routes array", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ routes: [] }),
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result).toBeNull();
  });

  it("returns null when routes field is missing", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result).toBeNull();
  });

  it("handles route with no polyline", async () => {
    const response = createDirectionsResponse();
    response.routes[0].polyline = undefined as any;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => response,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result).not.toBeNull();
    expect(result!.coordinates).toEqual([]);
  });

  it("handles steps with missing navigationInstruction", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          distanceMeters: 100,
          duration: "60s",
          legs: [
            {
              steps: [
                {
                  distanceMeters: 100,
                  staticDuration: "60s",
                  polyline: { encodedPolyline: "_p~iF~ps|U" },
                },
              ],
            },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => response,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result!.steps[0].instruction).toBe("");
    expect(result!.steps[0].maneuver).toBe("");
  });

  it("handles steps with no polyline", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          distanceMeters: 100,
          duration: "60s",
          legs: [
            {
              steps: [
                {
                  distanceMeters: 100,
                  staticDuration: "60s",
                  navigationInstruction: {
                    instructions: "Go",
                    maneuver: "DEPART",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => response,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result!.steps[0].coordinates).toEqual([]);
  });

  it("handles route with missing distanceMeters and duration", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          legs: [],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => response,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result!.distanceMeters).toBe(0);
    expect(result!.durationSeconds).toBe(0);
  });

  it("handles route with missing legs", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          distanceMeters: 100,
          duration: "60s",
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => response,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result!.steps).toEqual([]);
  });

  it("handles steps with missing distanceMeters and staticDuration", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          distanceMeters: 100,
          duration: "60s",
          legs: [
            {
              steps: [
                {
                  polyline: { encodedPolyline: "_p~iF~ps|U" },
                  navigationInstruction: {
                    instructions: "Go",
                    maneuver: "DEPART",
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => response,
    });

    const result = await DirectionsService.fetchDirections(
      45.497,
      -73.579,
      45.458,
      -73.64,
    );

    expect(result!.steps[0].distanceMeters).toBe(0);
    expect(result!.steps[0].durationSeconds).toBe(0);
  });

  it("re-throws errors after logging them", async () => {
    const error = new Error("test error");
    mockFetch.mockRejectedValueOnce(error);

    await expect(
      DirectionsService.fetchDirections(45.497, -73.579, 45.458, -73.64),
    ).rejects.toThrow("test error");

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching directions:",
      error,
    );
  });
});
