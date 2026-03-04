import { act, fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import DepartureTimePicker from "../../src/components/LocationScreen/DepartureTimePicker";
import { DepartureTimeConfig } from "../../src/types/Directions";

// ── Mocks ──

jest.mock("@expo/vector-icons/FontAwesome5", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockedIcon = (props: any) => (
    <Text testID={`fa5-${props.name}`}>{props.name}</Text>
  );
  MockedIcon.displayName = "FontAwesome5";
  return MockedIcon;
});

// Expose a helper so tests can fire the onChange callback
let _datePickerOnChange: ((event: any, date?: Date) => void) | undefined;
let _timePickerOnChange: ((event: any, date?: Date) => void) | undefined;

jest.mock("@react-native-community/datetimepicker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  const MockDateTimePicker = (props: any) => {
    if (props.mode === "time") {
      _timePickerOnChange = props.onChange;
    } else {
      _datePickerOnChange = props.onChange;
    }
    return <View testID={props.testID ?? "date-time-picker"} />;
  };
  MockDateTimePicker.displayName = "DateTimePicker";
  return { __esModule: true, default: MockDateTimePicker };
});

jest.mock("../../src/constants", () => ({
  COLORS: { concordiaMaroon: "#8b2020", textSecondary: "#666" },
}));

jest.mock("../../src/styles/DirectionPanel", () => ({
  __esModule: true,
  default: {
    departureWrapper: {},
    departureToggle: {},
    departureToggleText: {},
    departureToggleTime: {},
    departureOptions: {},
    departurePill: {},
    departurePillActive: {},
    departurePillText: {},
    departurePillTextActive: {},
    departureDateTimeRow: {},
    departureDateBtn: {},
    departureDateText: {},
    departurePastTimeWarning: {},
  },
}));

// ── Helpers ──

const fixedDate = new Date("2026-03-03T10:00:00");

function makeConfig(
  option: DepartureTimeConfig["option"],
): DepartureTimeConfig {
  return { option, date: fixedDate };
}

// ── Tests ──

describe("DepartureTimePicker", () => {
  const onConfigChange = jest.fn();

  beforeEach(() => {
    onConfigChange.mockClear();
    _datePickerOnChange = undefined;
    _timePickerOnChange = undefined;
  });

  // ── Label display ──

  it('shows "Leave now" label when option is "now"', () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    expect(screen.getByText("Leave now")).toBeTruthy();
  });

  it('shows "Depart at" label when option is "depart_at"', () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    expect(screen.getByText("Depart at")).toBeTruthy();
  });

  it('shows "Arrive by" label when option is "arrive_by"', () => {
    render(
      <DepartureTimePicker
        config={makeConfig("arrive_by")}
        onConfigChange={onConfigChange}
      />,
    );
    expect(screen.getByText("Arrive by")).toBeTruthy();
  });

  // ── Date/time row visibility ──

  it("hides date/time button when option is now", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    expect(screen.queryByLabelText("Select date and time")).toBeNull();
  });

  it("shows date and time button when option is depart_at", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    expect(screen.getByLabelText("Select date and time")).toBeTruthy();
  });

  it("shows date and time button when option is arrive_by", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("arrive_by")}
        onConfigChange={onConfigChange}
      />,
    );
    expect(screen.getByLabelText("Select date and time")).toBeTruthy();
  });

  // ── Toggle expand / collapse ──

  it("expands option list when toggle is pressed", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Change departure time"));
    expect(screen.getByLabelText("Departure time options")).toBeTruthy();
    expect(screen.getByLabelText("Leave now")).toBeTruthy();
    expect(screen.getByLabelText("Depart at")).toBeTruthy();
    expect(screen.getByLabelText("Arrive by")).toBeTruthy();
  });

  it("collapses option list when toggle is pressed again", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Change departure time"));
    fireEvent.press(screen.getByLabelText("Change departure time"));
    expect(screen.queryByLabelText("Departure time options")).toBeNull();
  });

  // ── Option selection ──

  it('calls onConfigChange with option "depart_at" when pill is pressed', () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Change departure time"));
    fireEvent.press(screen.getByLabelText("Depart at"));
    expect(onConfigChange).toHaveBeenCalledWith({
      option: "depart_at",
      date: fixedDate,
    });
  });

  it('calls onConfigChange with option "arrive_by" when pill is pressed', () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Change departure time"));
    fireEvent.press(screen.getByLabelText("Arrive by"));
    expect(onConfigChange).toHaveBeenCalledWith({
      option: "arrive_by",
      date: fixedDate,
    });
  });

  it('calls onConfigChange with option "now" and a Date when Leave now is pressed', () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Change departure time"));
    fireEvent.press(screen.getByLabelText("Leave now"));
    expect(onConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({ option: "now", date: expect.any(Date) }),
    );
  });

  it("collapses options after selecting one", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("now")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Change departure time"));
    fireEvent.press(screen.getByLabelText("Depart at"));
    expect(screen.queryByLabelText("Departure time options")).toBeNull();
  });

  // ── Date/time pickers ──

  it("shows date picker when Select date and time is pressed", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Select date and time"));
    expect(screen.getByTestId("date-picker")).toBeTruthy();
  });

  it("shows time picker after date is picked (chained flow)", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Select date and time"));
    const newDate = new Date("2026-04-15T00:00:00");
    act(() => {
      _datePickerOnChange?.({}, newDate);
    });
    expect(screen.getByTestId("time-picker")).toBeTruthy();
  });

  // ── handleDateChange ──

  it("calls onConfigChange with merged date when date picker changes", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Select date and time"));

    const newDate = new Date("2026-04-15T00:00:00");
    act(() => {
      _datePickerOnChange?.({}, newDate);
    });

    expect(onConfigChange).toHaveBeenCalledTimes(1);
    const called = onConfigChange.mock.calls[0][0] as DepartureTimeConfig;
    expect(called.date.getFullYear()).toBe(2026);
    expect(called.date.getMonth()).toBe(3); // April = 3
    expect(called.date.getDate()).toBe(15);
  });

  it("does not call onConfigChange when date picker fires with no date", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    fireEvent.press(screen.getByLabelText("Select date and time"));
    act(() => {
      _datePickerOnChange?.({}, undefined);
    });
    expect(onConfigChange).not.toHaveBeenCalled();
  });

  // ── handleTimeChange ──

  it("calls onConfigChange with merged time when time picker changes", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    // Open date picker, then pick a date to chain into time picker
    fireEvent.press(screen.getByLabelText("Select date and time"));
    act(() => {
      _datePickerOnChange?.({}, new Date("2026-03-03T10:00:00"));
    });

    const newTime = new Date("2026-03-03T14:30:00");
    act(() => {
      _timePickerOnChange?.({}, newTime);
    });

    // First call is from date change, second from time change
    const timeCalls = onConfigChange.mock.calls;
    const lastCall = timeCalls[timeCalls.length - 1][0] as DepartureTimeConfig;
    expect(lastCall.date.getHours()).toBe(14);
    expect(lastCall.date.getMinutes()).toBe(30);
  });

  it("does not call onConfigChange when time picker fires with no date", () => {
    render(
      <DepartureTimePicker
        config={makeConfig("depart_at")}
        onConfigChange={onConfigChange}
      />,
    );
    // Open date picker, then pick a date to chain into time picker
    fireEvent.press(screen.getByLabelText("Select date and time"));
    act(() => {
      _datePickerOnChange?.({}, new Date("2026-03-03T10:00:00"));
    });
    onConfigChange.mockClear();
    act(() => {
      _timePickerOnChange?.({}, undefined);
    });
    expect(onConfigChange).not.toHaveBeenCalled();
  });

  // ── Past-time warning ──

  it("shows warning when option is depart_at and date is in the past", () => {
    const pastConfig: DepartureTimeConfig = {
      option: "depart_at",
      date: new Date("2020-01-01T10:00:00"),
    };
    render(
      <DepartureTimePicker
        config={pastConfig}
        onConfigChange={onConfigChange}
      />,
    );
    expect(
      screen.getByText("Please select a future date and time."),
    ).toBeTruthy();
  });

  it("shows warning when option is arrive_by and date is in the past", () => {
    const pastConfig: DepartureTimeConfig = {
      option: "arrive_by",
      date: new Date("2020-01-01T10:00:00"),
    };
    render(
      <DepartureTimePicker
        config={pastConfig}
        onConfigChange={onConfigChange}
      />,
    );
    expect(
      screen.getByText("Please select a future date and time."),
    ).toBeTruthy();
  });

  it("does not show warning when option is now (regardless of date)", () => {
    const pastConfig: DepartureTimeConfig = {
      option: "now",
      date: new Date("2020-01-01T10:00:00"),
    };
    render(
      <DepartureTimePicker
        config={pastConfig}
        onConfigChange={onConfigChange}
      />,
    );
    expect(
      screen.queryByText("Please select a future date and time."),
    ).toBeNull();
  });

  it("does not show warning when date is in the future", () => {
    const futureConfig: DepartureTimeConfig = {
      option: "depart_at",
      date: new Date("2099-12-31T23:59:00"),
    };
    render(
      <DepartureTimePicker
        config={futureConfig}
        onConfigChange={onConfigChange}
      />,
    );
    expect(
      screen.queryByText("Please select a future date and time."),
    ).toBeNull();
  });
});
