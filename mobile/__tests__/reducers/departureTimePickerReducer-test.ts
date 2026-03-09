import {
  departureTimePickerReducer,
  initialDepartureTimePickerState,
} from "../../src/reducers/departureTimePickerReducer";
import { DepartureTimePickerState } from "../../src/state/DepartureTimePickerState";

const base: DepartureTimePickerState = initialDepartureTimePickerState;

describe("departureTimePickerReducer", () => {
  it("returns the initial state unchanged for an unknown action", () => {
    // @ts-expect-error testing unknown action
    expect(departureTimePickerReducer(base, { type: "UNKNOWN" })).toEqual(base);
  });

  it("TOGGLE_EXPANDED: false → true", () => {
    const next = departureTimePickerReducer(base, { type: "TOGGLE_EXPANDED" });
    expect(next.expanded).toBe(true);
  });

  it("TOGGLE_EXPANDED: true → false", () => {
    const expanded = { ...base, expanded: true };
    const next = departureTimePickerReducer(expanded, {
      type: "TOGGLE_EXPANDED",
    });
    expect(next.expanded).toBe(false);
  });

  it("COLLAPSE: sets expanded to false", () => {
    const expanded = { ...base, expanded: true };
    const next = departureTimePickerReducer(expanded, { type: "COLLAPSE" });
    expect(next.expanded).toBe(false);
  });

  it("SHOW_DATE_PICKER: sets showDatePicker to true", () => {
    const next = departureTimePickerReducer(base, {
      type: "SHOW_DATE_PICKER",
    });
    expect(next.showDatePicker).toBe(true);
  });

  it("HIDE_DATE_PICKER: sets showDatePicker to false", () => {
    const withPicker = { ...base, showDatePicker: true };
    const next = departureTimePickerReducer(withPicker, {
      type: "HIDE_DATE_PICKER",
    });
    expect(next.showDatePicker).toBe(false);
  });

  it("SHOW_TIME_PICKER: sets showTimePicker to true", () => {
    const next = departureTimePickerReducer(base, {
      type: "SHOW_TIME_PICKER",
    });
    expect(next.showTimePicker).toBe(true);
  });

  it("HIDE_TIME_PICKER: sets showTimePicker to false", () => {
    const withPicker = { ...base, showTimePicker: true };
    const next = departureTimePickerReducer(withPicker, {
      type: "HIDE_TIME_PICKER",
    });
    expect(next.showTimePicker).toBe(false);
  });

  it("does not mutate the original state", () => {
    const frozen = Object.freeze({ ...base });
    expect(() =>
      departureTimePickerReducer(frozen, { type: "TOGGLE_EXPANDED" }),
    ).not.toThrow();
  });
});
