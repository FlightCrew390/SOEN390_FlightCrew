import { API_CONFIG } from "../../src/constants";
import { IndoorPathfindingService } from "../../src/services/IndoorPathfindingService";

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(API_CONFIG, "getBaseUrl").mockReturnValue("http://localhost:8080");
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("IndoorPathfindingService", () => {
  it("getDirections returns successful response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        distanceMeters: 50,
      }),
    });

    const result = await IndoorPathfindingService.getDirections(
      "H",
      "node1",
      "node2",
      true,
    );

    expect(result.distanceMeters).toBe(50);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/indoor/directions?"),
      { signal: undefined },
    );

    const [requestUrl] = mockFetch.mock.calls[0];
    expect(requestUrl).toContain("buildingId=H");
    expect(requestUrl).toContain("startNodeId=node1");
    expect(requestUrl).toContain("endNodeId=node2");
    expect(requestUrl).toContain("requireAccessible=true");
  });

  it("throws when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(
      IndoorPathfindingService.getDirections("H", "node1", "node2"),
    ).rejects.toThrow("Indoor routing failed with status 500");
  });

  it("handles 404 cleanly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(
      IndoorPathfindingService.getDirections("H", "node1", "node2"),
    ).rejects.toThrow("Indoor routing failed with status 404");
  });

  it("handles fetch failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network Error"));

    await expect(
      IndoorPathfindingService.getDirections("H", "node1", "node2"),
    ).rejects.toThrow("Network Error");
  });
});
