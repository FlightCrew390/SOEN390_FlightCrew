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

  it("appends departureTime param when provided", async () => {
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
      "TRANSIT",
      "2026-03-03T09:00:00Z",
    );

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("departureTime=2026-03-03T09%3A00%3A00Z");
  });

  it("appends arrivalTime param when provided", async () => {
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
      "TRANSIT",
      undefined,
      "2026-03-03T10:00:00Z",
    );

    const calledUrl: string = mockFetch.mock.calls[0][0];
    expect(calledUrl).toContain("arrivalTime=2026-03-03T10%3A00%3A00Z");
  });

  it("parses transit step details into transitDetails field", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          distanceMeters: 5000,
          duration: "900s",
          legs: [
            {
              distanceMeters: 5000,
              duration: "900s",
              steps: [
                {
                  distanceMeters: 5000,
                  staticDuration: "900s",
                  polyline: { encodedPolyline: "_p~iF~ps|U" },
                  navigationInstruction: {
                    instructions: "Take the 80 bus",
                    maneuver: "STRAIGHT",
                  },
                  transitDetails: {
                    stopDetails: {
                      departureStop: { name: "Guy-Concordia" },
                      arrivalStop: { name: "Berri-UQAM" },
                      departureTime: "2026-03-03T09:15:00Z",
                      arrivalTime: "2026-03-03T09:30:00Z",
                    },
                    transitLine: {
                      name: "Green Line",
                      nameShort: "1",
                      vehicle: {
                        type: "SUBWAY",
                        name: { text: "Metro" },
                      },
                    },
                    stopCount: 5,
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
      "TRANSIT",
    );

    expect(result).not.toBeNull();
    expect(result!.steps).toHaveLength(1);

    const transit = result!.steps[0].transitDetails!;
    expect(transit.departureStopName).toBe("Guy-Concordia");
    expect(transit.arrivalStopName).toBe("Berri-UQAM");
    expect(transit.departureTime).toBe("2026-03-03T09:15:00Z");
    expect(transit.arrivalTime).toBe("2026-03-03T09:30:00Z");
    expect(transit.lineName).toBe("Green Line");
    expect(transit.lineShortName).toBe("1");
    expect(transit.vehicleType).toBe("SUBWAY");
    expect(transit.vehicleName).toBe("Metro");
    expect(transit.stopCount).toBe(5);
  });

  it("handles transit step with missing nested fields gracefully", async () => {
    const response = {
      routes: [
        {
          polyline: { encodedPolyline: "_p~iF~ps|U" },
          distanceMeters: 1000,
          duration: "300s",
          legs: [
            {
              steps: [
                {
                  distanceMeters: 1000,
                  staticDuration: "300s",
                  navigationInstruction: {
                    instructions: "Take transit",
                    maneuver: "STRAIGHT",
                  },
                  transitDetails: {
                    // All nested fields missing
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

    const transit = result!.steps[0].transitDetails!;
    expect(transit.departureStopName).toBe("");
    expect(transit.arrivalStopName).toBe("");
    expect(transit.lineName).toBe("");
    expect(transit.lineShortName).toBe("");
    expect(transit.vehicleType).toBe("");
    expect(transit.vehicleName).toBe("");
    expect(transit.stopCount).toBe(0);
  });
});
