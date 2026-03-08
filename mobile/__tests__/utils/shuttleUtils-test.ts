import {
  getCampusForLocation,
  getCampusForBuilding,
  isShuttleEligible,
  isWithinOperatingHours,
  getNextDeparture,
  parseScheduleTime,
  getDayOfWeek,
  SHUTTLE_STOPS,
} from "../../src/utils/shuttleUtils";
import { Building, StructureType } from "../../src/types/Building";
import type { ShuttleSchedule } from "../../src/services/ShuttleService";

const makeBuilding = (campus: string): Building => ({
  campus,
  buildingCode: "TEST",
  buildingName: "Test Building",
  buildingLongName: "Test Building Long Name",
  address: "123 Test St.",
  latitude: 45.0,
  longitude: -73.0,
  structureType: StructureType.Building,
  accessibilityInfo: "N/A",
});

const makeDeparture = (
  loy: string | null,
  sgw: string | null,
  lastBus = false,
) => ({
  loyola_departure: loy,
  sgw_departure: sgw,
  last_bus: lastBus,
});

const makeSchedule = (
  overrides: Partial<ShuttleSchedule> = {},
): ShuttleSchedule => ({
  day: "MONDAY",
  no_service: false,
  service_start: "09:15",
  service_end: "18:30",
  departures: [
    makeDeparture("09:15", "09:30"),
    makeDeparture("12:00", "12:15"),
    makeDeparture("18:15", "18:30", true),
    makeDeparture("18:30", null, true),
  ],
  ...overrides,
});

describe("shuttleUtils", () => {
  describe("getCampusForLocation", () => {
    it("returns SGW for coordinates near SGW campus", () => {
      expect(getCampusForLocation(45.4953, -73.5789)).toBe("SGW");
    });

    it("returns LOY for coordinates near Loyola campus", () => {
      expect(getCampusForLocation(45.4582, -73.6405)).toBe("LOY");
    });

    it("returns null for coordinates far from both campuses", () => {
      expect(getCampusForLocation(45.0, -73.0)).toBeNull();
    });

    it("returns SGW for slightly offset coordinates within proximity", () => {
      expect(getCampusForLocation(45.496, -73.579)).toBe("SGW");
    });

    it("returns LOY for slightly offset coordinates within proximity", () => {
      expect(getCampusForLocation(45.459, -73.641)).toBe("LOY");
    });
  });

  describe("getCampusForBuilding", () => {
    it("returns SGW for SGW building", () => {
      expect(getCampusForBuilding(makeBuilding("SGW"))).toBe("SGW");
    });

    it("returns LOY for LOY building", () => {
      expect(getCampusForBuilding(makeBuilding("LOY"))).toBe("LOY");
    });

    it("returns null for unknown campus", () => {
      expect(getCampusForBuilding(makeBuilding("OTHER"))).toBeNull();
    });

    it("is case-insensitive", () => {
      expect(getCampusForBuilding(makeBuilding("sgw"))).toBe("SGW");
      expect(getCampusForBuilding(makeBuilding("loy"))).toBe("LOY");
    });
  });

  describe("isShuttleEligible", () => {
    it("returns true for cross-campus", () => {
      expect(isShuttleEligible("SGW", "LOY")).toBe(true);
      expect(isShuttleEligible("LOY", "SGW")).toBe(true);
    });

    it("returns false for same campus", () => {
      expect(isShuttleEligible("SGW", "SGW")).toBe(false);
      expect(isShuttleEligible("LOY", "LOY")).toBe(false);
    });

    it("returns false when either campus is null", () => {
      expect(isShuttleEligible(null, "SGW")).toBe(false);
      expect(isShuttleEligible("SGW", null)).toBe(false);
      expect(isShuttleEligible(null, null)).toBe(false);
    });
  });

  describe("parseScheduleTime", () => {
    it("parses HH:MM into a Date", () => {
      const ref = new Date(2026, 2, 7, 0, 0, 0);
      const result = parseScheduleTime("09:15", ref);
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(15);
      expect(result.getDate()).toBe(7);
    });
  });

  describe("isWithinOperatingHours", () => {
    it("returns false for no-service days", () => {
      const schedule = makeSchedule({ no_service: true });
      expect(isWithinOperatingHours(schedule, "LOY")).toBe(false);
    });

    it("returns false when no departures", () => {
      const schedule = makeSchedule({ departures: [] });
      expect(isWithinOperatingHours(schedule, "LOY")).toBe(false);
    });

    it("returns false when service_start is null", () => {
      const schedule = makeSchedule({ service_start: null });
      expect(isWithinOperatingHours(schedule, "LOY")).toBe(false);
    });

    it("returns true 30 minutes before service start", () => {
      const now = new Date(2026, 2, 7, 8, 45, 0); // 08:45, service starts 09:15
      const schedule = makeSchedule();
      expect(isWithinOperatingHours(schedule, "LOY", now)).toBe(true);
    });

    it("returns false more than 30 minutes before service start", () => {
      const now = new Date(2026, 2, 7, 8, 44, 0); // 08:44
      const schedule = makeSchedule();
      expect(isWithinOperatingHours(schedule, "LOY", now)).toBe(false);
    });

    it("returns true during service hours", () => {
      const now = new Date(2026, 2, 7, 12, 0, 0); // noon
      const schedule = makeSchedule();
      expect(isWithinOperatingHours(schedule, "LOY", now)).toBe(true);
    });

    it("returns false after last LOY departure", () => {
      // Last LOY departure is 18:30
      const now = new Date(2026, 2, 7, 18, 31, 0);
      const schedule = makeSchedule();
      expect(isWithinOperatingHours(schedule, "LOY", now)).toBe(false);
    });

    it("returns false after last SGW departure", () => {
      // Last SGW departure is 18:30 (the 18:30 LOY has null SGW, so last SGW is 18:30 from the 18:15 entry)
      const now = new Date(2026, 2, 7, 18, 31, 0);
      const schedule = makeSchedule();
      expect(isWithinOperatingHours(schedule, "SGW", now)).toBe(false);
    });

    it("returns true at exactly the last departure time", () => {
      const now = new Date(2026, 2, 7, 18, 30, 0);
      const schedule = makeSchedule();
      expect(isWithinOperatingHours(schedule, "LOY", now)).toBe(true);
    });
  });

  describe("getNextDeparture", () => {
    const departures = [
      makeDeparture("09:15", "09:30"),
      makeDeparture("12:00", "12:15"),
      makeDeparture("18:15", "18:30", true),
    ];

    it("finds next departure from LOY after a given time", () => {
      const now = new Date(2026, 2, 7, 11, 0, 0);
      const result = getNextDeparture(departures, "LOY", now);
      expect(result).not.toBeNull();
      expect(result!.departureTime.getHours()).toBe(12);
      expect(result!.departureTime.getMinutes()).toBe(0);
    });

    it("finds next departure from SGW after a given time", () => {
      const now = new Date(2026, 2, 7, 11, 0, 0);
      const result = getNextDeparture(departures, "SGW", now);
      expect(result).not.toBeNull();
      expect(result!.departureTime.getHours()).toBe(12);
      expect(result!.departureTime.getMinutes()).toBe(15);
    });

    it("returns first departure when before service start", () => {
      const now = new Date(2026, 2, 7, 8, 0, 0);
      const result = getNextDeparture(departures, "LOY", now);
      expect(result).not.toBeNull();
      expect(result!.departureTime.getHours()).toBe(9);
      expect(result!.departureTime.getMinutes()).toBe(15);
    });

    it("returns null when after last departure", () => {
      const now = new Date(2026, 2, 7, 19, 0, 0);
      const result = getNextDeparture(departures, "LOY", now);
      expect(result).toBeNull();
    });

    it("returns departure at exact departure time", () => {
      const now = new Date(2026, 2, 7, 12, 0, 0);
      const result = getNextDeparture(departures, "LOY", now);
      expect(result).not.toBeNull();
      expect(result!.departureTime.getHours()).toBe(12);
    });

    it("skips departures with null for origin campus", () => {
      const deps = [
        makeDeparture("09:15", null),
        makeDeparture("10:00", "10:15"),
      ];
      const now = new Date(2026, 2, 7, 8, 0, 0);
      const result = getNextDeparture(deps, "SGW", now);
      expect(result).not.toBeNull();
      expect(result!.departureTime.getHours()).toBe(10);
      expect(result!.departureTime.getMinutes()).toBe(15);
    });
  });

  describe("getDayOfWeek", () => {
    it("returns correct day name", () => {
      // March 7 2026 is a Saturday
      const sat = new Date(2026, 2, 7);
      expect(getDayOfWeek(sat)).toBe("SATURDAY");

      const mon = new Date(2026, 2, 2);
      expect(getDayOfWeek(mon)).toBe("MONDAY");

      const fri = new Date(2026, 2, 6);
      expect(getDayOfWeek(fri)).toBe("FRIDAY");
    });
  });

  describe("SHUTTLE_STOPS", () => {
    it("has SGW and LOY stops defined", () => {
      expect(SHUTTLE_STOPS.SGW).toBeDefined();
      expect(SHUTTLE_STOPS.LOY).toBeDefined();
      expect(SHUTTLE_STOPS.SGW.latitude).toBeCloseTo(45.49697, 4);
      expect(SHUTTLE_STOPS.LOY.latitude).toBeCloseTo(45.45865, 4);
    });
  });
});
