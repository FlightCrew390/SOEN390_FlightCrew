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

    it("returns valid sgw_to_loyola coordinates", async () => {
      const routeData = {
        duration: "21 mins",
        distance: "8.3 km",
        sgw_to_loyola: [
          { latitude: 45.49697, longitude: -73.57851 },
          { latitude: 45.45865, longitude: -73.63896 },
        ],
        loyola_to_sgw: [
          { latitude: 45.45865, longitude: -73.63896 },
          { latitude: 45.49697, longitude: -73.57851 },
        ],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => routeData,
      });

      const result = await ShuttleService.getRoute();
      for (const coord of result.sgw_to_loyola) {
        expect(coord.latitude).toBeGreaterThan(45);
        expect(coord.longitude).toBeLessThan(-73);
      }
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

    it("returns no_service true for weekend", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          day: "SATURDAY",
          no_service: true,
          service_start: null,
          service_end: null,
          departures: [],
        }),
      });

      const result = await ShuttleService.getSchedule("SATURDAY");
      expect(result.no_service).toBe(true);
      expect(result.departures).toEqual([]);
    });

    it("departures have loyola_departure, sgw_departure, last_bus fields", async () => {
      const departures = [
        { loyola_departure: "09:15", sgw_departure: "09:30", last_bus: false },
        { loyola_departure: "18:30", sgw_departure: null, last_bus: true },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          day: "TUESDAY",
          no_service: false,
          service_start: "09:15",
          service_end: "18:30",
          departures,
        }),
      });

      const result = await ShuttleService.getSchedule("TUESDAY");
      expect(result.departures[0]).toHaveProperty("loyola_departure");
      expect(result.departures[0]).toHaveProperty("sgw_departure");
      expect(result.departures[0]).toHaveProperty("last_bus");
      const lastBusEntries = result.departures.filter((d) => d.last_bus);
      expect(lastBusEntries.length).toBeGreaterThan(0);
    });

    it("throws on non-ok response", async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

      await expect(ShuttleService.getSchedule()).rejects.toThrow(
        "Shuttle schedule failed: 404",
      );
    });
  });
});
