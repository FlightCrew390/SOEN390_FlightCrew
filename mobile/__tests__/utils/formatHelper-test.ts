import { formatDate, formatDistance, formatDuration, formatTime } from "../../src/utils/formatHelper";

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

describe("formatTime", () => {
  it("delegates to toLocaleTimeString with the correct options", () => {
    const d = new Date("2026-03-03T10:05:00");
    const spy = jest
      .spyOn(d, "toLocaleTimeString")
      .mockReturnValue("10:05 AM");

    const result = formatTime(d);

    expect(spy).toHaveBeenCalledWith(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    expect(result).toBe("10:05 AM");
    spy.mockRestore();
  });
});
