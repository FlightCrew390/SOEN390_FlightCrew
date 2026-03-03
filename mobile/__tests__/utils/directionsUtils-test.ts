import {
  getDepartureDate,
  getManeuverIcon,
  parseTime,
} from "../../src/utils/directionsUtils";
import { DepartureTimeConfig } from "../../src/types/Directions";

// ── getManeuverIcon ──

describe("getManeuverIcon", () => {
  const cases: [string, string][] = [
    ["DEPART", "start"],
    ["STRAIGHT", "straight"],
    ["RAMP_LEFT", "ramp-left"],
    ["RAMP_RIGHT", "ramp-right"],
    ["MERGE", "merge"],
    ["FORK_LEFT", "fork-left"],
    ["FORK_RIGHT", "fork-right"],
    ["FERRY", "directions-ferry"],
    ["TURN_LEFT", "turn-left"],
    ["TURN_SLIGHT_LEFT", "turn-slight-left"],
    ["TURN_SHARP_LEFT", "turn-sharp-left"],
    ["TURN_RIGHT", "turn-right"],
    ["TURN_SLIGHT_RIGHT", "turn-slight-right"],
    ["TURN_SHARP_RIGHT", "turn-sharp-right"],
    ["ROUNDABOUT_LEFT", "roundabout-left"],
    ["ROUNDABOUT_RIGHT", "roundabout-right"],
    ["UTURN_LEFT", "u-turn-left"],
    ["UTURN_RIGHT", "u-turn-right"],
  ];

  it.each(cases)("maps %s → %s", (maneuver, expected) => {
    expect(getManeuverIcon(maneuver)).toBe(expected);
  });

  it("returns dot-circle for unknown maneuver", () => {
    expect(getManeuverIcon("UNKNOWN_MANEUVER")).toBe("dot-circle");
    expect(getManeuverIcon("")).toBe("dot-circle");
  });
});

// ── parseTime ──

describe("parseTime", () => {
  it("returns null for undefined", () => {
    expect(parseTime(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseTime("")).toBeNull();
  });

  it("returns null for an invalid ISO string", () => {
    expect(parseTime("not-a-date")).toBeNull();
  });

  it("returns a Date for a valid ISO string", () => {
    const iso = "2026-03-03T10:00:00";
    const result = parseTime(iso);
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(new Date(iso).getTime());
  });
});

// ── getDepartureDate ──

describe("getDepartureDate", () => {
  const fixedDate = new Date("2026-03-03T12:00:00");

  it('returns config.date for "depart_at"', () => {
    const config: DepartureTimeConfig = { option: "depart_at", date: fixedDate };
    expect(getDepartureDate(config, 600)).toEqual(fixedDate);
  });

  it('works backwards from arrival for "arrive_by"', () => {
    const config: DepartureTimeConfig = { option: "arrive_by", date: fixedDate };
    const result = getDepartureDate(config, 600);
    expect(result.getTime()).toBe(fixedDate.getTime() - 600 * 1000);
  });

  it('returns a date close to now for "now"', () => {
    const before = Date.now();
    const config: DepartureTimeConfig = { option: "now", date: fixedDate };
    const result = getDepartureDate(config, 0);
    const after = Date.now();
    expect(result.getTime()).toBeGreaterThanOrEqual(before);
    expect(result.getTime()).toBeLessThanOrEqual(after);
  });
});
