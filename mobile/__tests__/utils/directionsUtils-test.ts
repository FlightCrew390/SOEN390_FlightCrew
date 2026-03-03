import { DepartureTimeConfig, StepInfo } from "../../src/types/Directions";
import {
  computeStepTimeline,
  getDepartureDate,
  getManeuverIcon,
  parseTime,
} from "../../src/utils/directionsUtils";

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

  it("returns navigation for unknown maneuver", () => {
    expect(getManeuverIcon("UNKNOWN_MANEUVER")).toBe("navigation");
    expect(getManeuverIcon("")).toBe("navigation");
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
    const config: DepartureTimeConfig = {
      option: "depart_at",
      date: fixedDate,
    };
    expect(getDepartureDate(config, 600)).toEqual(fixedDate);
  });

  it('works backwards from arrival for "arrive_by"', () => {
    const config: DepartureTimeConfig = {
      option: "arrive_by",
      date: fixedDate,
    };
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

// ── computeStepTimeline ──

function makeStep(overrides: Partial<StepInfo> = {}): StepInfo {
  return {
    distanceMeters: 100,
    durationSeconds: 60,
    instruction: "Walk north",
    maneuver: "STRAIGHT",
    coordinates: [],
    ...overrides,
  };
}

describe("computeStepTimeline", () => {
  const t0 = new Date("2026-03-03T10:00:00");

  it("filters out steps with empty instructions", () => {
    const steps = [
      makeStep({ instruction: "Walk north" }),
      makeStep({ instruction: "" }),
    ];
    const { visibleSteps } = computeStepTimeline(steps, t0);
    expect(visibleSteps).toHaveLength(1);
    expect(visibleSteps[0].instruction).toBe("Walk north");
  });

  it("assigns the departure time to the first step", () => {
    const steps = [makeStep(), makeStep()];
    const { stepTimes, departureDate } = computeStepTimeline(steps, t0);
    expect(stepTimes[0].getTime()).toBe(t0.getTime());
    expect(departureDate.getTime()).toBe(t0.getTime());
  });

  it("advances the clock by durationSeconds when no real arrival time", () => {
    const steps = [makeStep({ durationSeconds: 120 }), makeStep()];
    const { stepTimes } = computeStepTimeline(steps, t0);
    expect(stepTimes[1].getTime()).toBe(t0.getTime() + 120 * 1000);
  });

  it("snaps the clock to a real transit departure time", () => {
    const snapTime = "2026-03-03T10:05:00";
    const steps = [
      makeStep(),
      makeStep({
        transitDetails: {
          departureTime: snapTime,
          arrivalTime: "",
          departureStopName: "A",
          arrivalStopName: "B",
          lineName: "L1",
          lineShortName: "1",
          vehicleType: "BUS",
          vehicleName: "Bus",
          stopCount: 3,
        },
      }),
    ];
    const { stepTimes } = computeStepTimeline(steps, t0);
    expect(stepTimes[1].getTime()).toBe(new Date(snapTime).getTime());
  });

  it("uses real transit arrival time to advance the clock", () => {
    const depTime = "2026-03-03T10:05:00";
    const arrTime = "2026-03-03T10:15:00";
    const steps = [
      makeStep({
        durationSeconds: 0,
        transitDetails: {
          departureTime: depTime,
          arrivalTime: arrTime,
          departureStopName: "A",
          arrivalStopName: "B",
          lineName: "L1",
          lineShortName: "1",
          vehicleType: "BUS",
          vehicleName: "Bus",
          stopCount: 3,
        },
      }),
      makeStep(),
    ];
    const { stepTimes } = computeStepTimeline(steps, t0);
    expect(stepTimes[1].getTime()).toBe(new Date(arrTime).getTime());
  });

  it("sets arrivalDate to clock time after last step", () => {
    const steps = [makeStep({ durationSeconds: 300 })];
    const { arrivalDate } = computeStepTimeline(steps, t0);
    expect(arrivalDate.getTime()).toBe(t0.getTime() + 300 * 1000);
  });

  it("returns initialDeparture as departureDate when no visible steps", () => {
    const { departureDate, arrivalDate } = computeStepTimeline([], t0);
    expect(departureDate.getTime()).toBe(t0.getTime());
    expect(arrivalDate.getTime()).toBe(t0.getTime());
  });
});
