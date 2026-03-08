import { ShuttleService } from "../../src/services/ShuttleService";

const MON_THU_DEPARTURES = [
  { loyola_departure: "09:15", sgw_departure: "09:30", last_bus: false },
  { loyola_departure: "12:00", sgw_departure: "12:15", last_bus: false },
  { loyola_departure: "18:15", sgw_departure: "18:30", last_bus: true },
  { loyola_departure: "18:30", sgw_departure: null, last_bus: true },
];

const FRIDAY_DEPARTURES = [
  { loyola_departure: "09:15", sgw_departure: "09:45", last_bus: false },
  { loyola_departure: "17:45", sgw_departure: "18:15", last_bus: true },
  { loyola_departure: "18:15", sgw_departure: null, last_bus: true },
];

const ROUTE_COORDS = [
  { latitude: 45.49697, longitude: -73.57851 },
  { latitude: 45.49668, longitude: -73.57876 },
  { latitude: 45.45865, longitude: -73.63896 },
];

function mockFetchJson(data: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(data),
  } as unknown as Response);
}

describe("ShuttleService", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("fetchSchedule", () => {
    it("returns Mon-Thu schedule for MONDAY", async () => {
      mockFetchJson({
        day: "MONDAY",
        no_service: false,
        service_start: "09:15",
        service_end: "18:30",
        departures: MON_THU_DEPARTURES,
      });
      const result = await ShuttleService.fetchSchedule("MONDAY");
      expect(result.day).toBe("MONDAY");
      expect(result.no_service).toBe(false);
      expect(result.service_start).toBeTruthy();
      expect(result.departures.length).toBeGreaterThan(0);
    });

    it("returns Friday schedule for FRIDAY", async () => {
      mockFetchJson({
        day: "FRIDAY",
        no_service: false,
        service_start: "09:15",
        service_end: "18:15",
        departures: FRIDAY_DEPARTURES,
      });
      const result = await ShuttleService.fetchSchedule("FRIDAY");
      expect(result.day).toBe("FRIDAY");
      expect(result.no_service).toBe(false);
      expect(result.departures.length).toBeGreaterThan(0);
    });

    it("returns no service for SATURDAY", async () => {
      mockFetchJson({
        day: "SATURDAY",
        no_service: true,
        service_start: null,
        service_end: null,
        departures: [],
      });
      const result = await ShuttleService.fetchSchedule("SATURDAY");
      expect(result.no_service).toBe(true);
      expect(result.departures).toEqual([]);
    });

    it("returns no service for SUNDAY", async () => {
      mockFetchJson({
        day: "SUNDAY",
        no_service: true,
        service_start: null,
        service_end: null,
        departures: [],
      });
      const result = await ShuttleService.fetchSchedule("SUNDAY");
      expect(result.no_service).toBe(true);
      expect(result.departures).toEqual([]);
    });

    it("has departures with loyola_departure and sgw_departure fields", async () => {
      mockFetchJson({
        day: "TUESDAY",
        no_service: false,
        service_start: "09:15",
        service_end: "18:30",
        departures: MON_THU_DEPARTURES,
      });
      const result = await ShuttleService.fetchSchedule("TUESDAY");
      const first = result.departures[0];
      expect(first).toHaveProperty("loyola_departure");
      expect(first).toHaveProperty("sgw_departure");
      expect(first).toHaveProperty("last_bus");
    });

    it("marks last bus entries correctly", async () => {
      mockFetchJson({
        day: "WEDNESDAY",
        no_service: false,
        service_start: "09:15",
        service_end: "18:30",
        departures: MON_THU_DEPARTURES,
      });
      const result = await ShuttleService.fetchSchedule("WEDNESDAY");
      const lastBusEntries = result.departures.filter((d) => d.last_bus);
      expect(lastBusEntries.length).toBeGreaterThan(0);
    });

    it("throws on non-ok response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
      } as unknown as Response);
      await expect(ShuttleService.fetchSchedule("BADDAY")).rejects.toThrow(
        "Failed to fetch shuttle schedule: 400",
      );
    });
  });

  describe("fetchRoute", () => {
    const routeResponse = {
      duration: "21 mins",
      distance: "8.3 km",
      sgw_to_loyola: ROUTE_COORDS,
      loyola_to_sgw: [...ROUTE_COORDS].reverse(),
    };

    it("returns route with both direction polylines", async () => {
      mockFetchJson(routeResponse);
      const result = await ShuttleService.fetchRoute();
      expect(result.sgw_to_loyola.length).toBeGreaterThan(0);
      expect(result.loyola_to_sgw.length).toBeGreaterThan(0);
      expect(result.duration).toBeTruthy();
      expect(result.distance).toBeTruthy();
    });

    it("loyola_to_sgw is reverse of sgw_to_loyola", async () => {
      mockFetchJson(routeResponse);
      const result = await ShuttleService.fetchRoute();
      const reversed = [...result.sgw_to_loyola].reverse();
      expect(result.loyola_to_sgw).toEqual(reversed);
    });

    it("has valid coordinates", async () => {
      mockFetchJson(routeResponse);
      const result = await ShuttleService.fetchRoute();
      for (const coord of result.sgw_to_loyola) {
        expect(coord.latitude).toBeGreaterThan(45);
        expect(coord.longitude).toBeLessThan(-73);
      }
    });

    it("throws on non-ok response", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
      } as unknown as Response);
      await expect(ShuttleService.fetchRoute()).rejects.toThrow(
        "Failed to fetch shuttle route: 500",
      );
    });
  });
});
