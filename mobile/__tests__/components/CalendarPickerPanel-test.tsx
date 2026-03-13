import { fireEvent, render, screen } from "@testing-library/react-native";
import CalendarPickerPanel from "../../src/components/MenuScreen/CalendarPickerPanel";
import { CalendarInfo } from "../../src/types/CalendarEvent";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

describe("CalendarPickerPanel", () => {
  const mockCalendars: CalendarInfo[] = [
    {
      id: "1",
      summary: "Work",
      description: "Work-related events",
      backgroundColor: "#ff0000",
      primary: true,
    },
    {
      id: "2",
      summary: "Personal",
      description: "Personal events",
      backgroundColor: "#00ff00",
      primary: false,
    },
  ];

  it("renders loading state", () => {
    render(
      <CalendarPickerPanel
        calendars={mockCalendars}
        loading={true}
        visible={true}
        preSelectedId={null}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(screen.getByText("Loading calendars…")).toBeTruthy();
  });

  it("renders calendar list", () => {
    render(
      <CalendarPickerPanel
        calendars={mockCalendars}
        loading={false}
        visible={true}
        preSelectedId={null}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(screen.getByText("Work")).toBeTruthy();
    expect(screen.getByText("Personal")).toBeTruthy();
  });

  it("syncs selected calendar with preSelectedId", () => {
    render(
      <CalendarPickerPanel
        calendars={mockCalendars}
        loading={false}
        visible={true}
        preSelectedId="2"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    const personalRow = screen.getByLabelText("Select Personal");
    expect(personalRow.props.accessibilityState.selected).toBe(true);
  });

  it("calls onConfirm with selected calendar ID", () => {
    const mockOnConfirm = jest.fn();
    render(
      <CalendarPickerPanel
        calendars={mockCalendars}
        loading={false}
        visible={true}
        preSelectedId={null}
        onConfirm={mockOnConfirm}
        onDismiss={jest.fn()}
      />,
    );
    const workRow: any = screen.getByLabelText("Select Work");
    fireEvent.press(workRow);
    expect(workRow.props.accessibilityState.selected).toBe(true);
    fireEvent.press(screen.getByText("Confirm"));
    expect(mockOnConfirm).toHaveBeenCalledWith("1");
  });

  it("syncs selection when preSelectedId changes", () => {
    const { rerender } = render(
      <CalendarPickerPanel
        calendars={mockCalendars}
        loading={false}
        visible={true}
        preSelectedId={null}
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(
      screen.getByLabelText("Select Work").props.accessibilityState.selected,
    ).toBe(false);
    rerender(
      <CalendarPickerPanel
        calendars={mockCalendars}
        loading={false}
        visible={true}
        preSelectedId="1"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(
      screen.getByLabelText("Select Work").props.accessibilityState.selected,
    ).toBe(true);
  });
});
