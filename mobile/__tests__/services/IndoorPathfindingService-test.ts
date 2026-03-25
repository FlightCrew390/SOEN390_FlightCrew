import { IndoorPathfindingService } from "../../src/services/IndoorPathfindingService";
import { API_CONFIG } from "../../src/constants";

const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(API_CONFIG, "getBaseUrl").mockReturnValue("http://localhost:8080");
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
      expect.stringContaining("buildingId=H"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("startNodeId=node1"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("endNodeId=node2"),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("requireAccessible=true"),
    );
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
