import {
  formatDate,
  formatDateTime,
  formatDistance,
  formatDuration,
  formatShuttleNextDeparturePhrase,
  formatTime,
} from "../../src/utils/formatHelper";
import { DEFAULT_DEPARTURE_CONFIG } from "../../src/types/Directions";

describe("formatDuration", () => {
  it("returns '-- min' for zero or negative", () => {
    expect(formatDuration(0)).toBe("-- min");
    expect(formatDuration(-10)).toBe("-- min");
  });

  it("returns minutes when < 60 min", () => {
    expect(formatDuration(120)).toBe("2 min");
    expect(formatDuration(2999)).toBe("50 min");
  });

  it("returns hr + min when >= 60 min", () => {
    expect(formatDuration(3660)).toBe("1 hr 1 min");
  });

  it("returns hr only when no remaining minutes", () => {
    expect(formatDuration(7200)).toBe("2 hr");
  });
});

describe("formatDistance", () => {
  it("returns '-- m' for zero or negative", () => {
    expect(formatDistance(0)).toBe("-- m");
    expect(formatDistance(-5)).toBe("-- m");
  });

  it("returns meters when < 1000", () => {
    expect(formatDistance(450)).toBe("450 m");
  });

  it("returns km when >= 1000", () => {
    expect(formatDistance(1500)).toBe("1.5 km");
    expect(formatDistance(10000)).toBe("10.0 km");
  });
});

describe("formatDate", () => {
  it("delegates to toLocaleDateString with the correct options", () => {
    const d = new Date("2026-03-03T10:00:00");
    const spy = jest
      .spyOn(d, "toLocaleDateString")
      .mockReturnValue("Tue, Mar 3");

    const result = formatDate(d);

    expect(spy).toHaveBeenCalledWith(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    expect(result).toBe("Tue, Mar 3");
    spy.mockRestore();
  });
});

describe("formatDateTime", () => {
  it("delegates to toLocaleTimeString with the correct options", () => {
    const d = new Date("2026-03-03T10:05:00");
    const spy = jest.spyOn(d, "toLocaleTimeString").mockReturnValue("10:05 AM");

    const result = formatDateTime(d);

    expect(spy).toHaveBeenCalledWith(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    expect(result).toBe("10:05 AM");
    spy.mockRestore();
  });
});

describe("formatTime", () => {
  it("formats a morning Date as h:mm AM", () => {
    const d = new Date("2026-03-03T10:05:00");
    expect(formatTime(d)).toBe("10:05 AM");
  });

  it("formats an afternoon Date as h:mm PM", () => {
    const d = new Date("2026-03-03T14:30:00");
    expect(formatTime(d)).toBe("2:30 PM");
  });

  it("formats an ISO string", () => {
    expect(formatTime("2026-03-03T10:05:00")).toBe("10:05 AM");
  });
});

describe("formatShuttleNextDeparturePhrase", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("uses relative wording within an hour when leaving now", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 2, 10, 0, 0));
    const dep = new Date(2026, 2, 2, 10, 5, 0);
    expect(
      formatShuttleNextDeparturePhrase(dep, DEFAULT_DEPARTURE_CONFIG),
    ).toBe("Next shuttle departs in 5 minutes");
  });

  it("uses singular minute", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 2, 10, 0, 0));
    const dep = new Date(2026, 2, 2, 10, 1, 0);
    expect(
      formatShuttleNextDeparturePhrase(dep, DEFAULT_DEPARTURE_CONFIG),
    ).toBe("Next shuttle departs in 1 minute");
  });

  it("uses soon when under ~30s", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 2, 10, 0, 0));
    const dep = new Date(2026, 2, 2, 10, 0, 15);
    expect(
      formatShuttleNextDeparturePhrase(dep, DEFAULT_DEPARTURE_CONFIG),
    ).toBe("Next shuttle departs soon");
  });

  it("uses clock time when more than 60 minutes away", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 2, 10, 0, 0));
    const dep = new Date(2026, 2, 2, 12, 15, 0);
    expect(
      formatShuttleNextDeparturePhrase(dep, DEFAULT_DEPARTURE_CONFIG),
    ).toBe("Next shuttle departs at 12:15 PM");
  });

  it("uses clock time when departure is in the past", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 2, 12, 0, 0));
    const dep = new Date(2026, 2, 2, 10, 0, 0);
    expect(
      formatShuttleNextDeparturePhrase(dep, DEFAULT_DEPARTURE_CONFIG),
    ).toBe("Next shuttle departs at 10:00 AM");
  });

  it("uses clock time for depart_at and arrive_by", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 2, 2, 9, 0, 0));
    const dep = new Date(2026, 2, 2, 10, 30, 0);
    expect(
      formatShuttleNextDeparturePhrase(dep, {
        option: "depart_at",
        date: new Date(2026, 2, 2, 9, 0, 0),
      }),
    ).toBe("Next shuttle departs at 10:30 AM");
    expect(
      formatShuttleNextDeparturePhrase(dep, {
        option: "arrive_by",
        date: new Date(2026, 2, 2, 11, 0, 0),
      }),
    ).toBe("Next shuttle departs at 10:30 AM");
  });
});
