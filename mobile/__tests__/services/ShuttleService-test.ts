import { ShuttleService } from "../../src/services/ShuttleService";

const mockFetch = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  globalThis.fetch = mockFetch;
});

describe("ShuttleService", () => {
  describe("getRoute", () => {
    it("returns route data on 200", async () => {
      const routeData = {
        duration: "21 mins",
        distance: "8.3 km",
        sgw_to_loyola: [
          { latitude: 45.497, longitude: -73.578 },
          { latitude: 45.458, longitude: -73.638 },
        ],
        loyola_to_sgw: [
          { latitude: 45.458, longitude: -73.638 },
          { latitude: 45.497, longitude: -73.578 },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => routeData,
      });

      const result = await ShuttleService.getRoute();

      expect(result).toEqual(routeData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/shuttle\/route$/),
      );
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await expect(ShuttleService.getRoute()).rejects.toThrow(
        "Shuttle route failed: 500",
      );
    });
  });

  describe("getSchedule", () => {
    it("returns schedule when no day param", async () => {
      const scheduleData = {
        day: "MONDAY",
        no_service: false,
        service_start: "09:15",
        service_end: "18:30",
        departures: [
          {
            loyola_departure: "09:15",
            sgw_departure: "09:30",
            last_bus: false,
          },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => scheduleData,
      });

      const result = await ShuttleService.getSchedule();

      expect(result).toEqual(scheduleData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/shuttle\/schedule$/),
      );
    });

    it("calls with day query when day provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          day: "FRIDAY",
          no_service: false,
          service_start: null,
          service_end: null,
          departures: [],
        }),
      });

      await ShuttleService.getSchedule("FRIDAY");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/shuttle/schedule?day=FRIDAY"),
      );
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(ShuttleService.getSchedule()).rejects.toThrow(
        "Shuttle schedule failed: 404",
      );
    });
  });
});
