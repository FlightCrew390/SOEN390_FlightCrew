import { fireEvent, render, screen } from "@testing-library/react-native";
import EventItem from "../../src/components/HomeScreen/EventItem";
import { CalendarEvent } from "../../src/types/CalendarEvent";
import { formatTime } from "../../src/utils/formatHelper";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));
const mockEvent: CalendarEvent = {
    id: "1",
    summary: "Test Event",
    description: "Test Description",
    location: "Test Location",
    start: new Date("2024-06-01T10:00:00Z").toISOString(),
    end: new Date("2024-06-01T11:00:00Z").toISOString(),
    allDay: false,
  },
  mockOnPress = jest.fn();

describe("EventItem", () => {
  it("renders event details correctly", () => {
    render(
      <EventItem
        event={mockEvent}
        isUpcoming={true}
        onPress={mockOnPress}
        onDirections={jest.fn()}
      />,
    );

    const expectedTime = `${formatTime(mockEvent.start)} - ${formatTime(mockEvent.end)}`;
    expect(screen.getByText("Test Event")).toBeTruthy();
    expect(screen.getByText(expectedTime)).toBeTruthy();
    expect(screen.getByText("Test Location")).toBeTruthy();
  });

  it("calls onPress when event is pressed", () => {
    render(
      <EventItem
        event={mockEvent}
        isUpcoming={true}
        onPress={mockOnPress}
        onDirections={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByText("Test Event"));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it("shows directions button when location is available", () => {
    const mockOnDirections = jest.fn();
    render(
      <EventItem
        event={mockEvent}
        isUpcoming={true}
        onPress={jest.fn()}
        onDirections={mockOnDirections}
      />,
    );
    fireEvent.press(screen.getByLabelText("Get directions to this class"));
    expect(mockOnDirections).toHaveBeenCalledWith(mockEvent);
  });

  it("shows error banner when location is missing", () => {
    const eventWithoutLocation = { ...mockEvent, location: "" };
    render(
      <EventItem
        event={eventWithoutLocation}
        isUpcoming={true}
        onPress={jest.fn()}
        onDirections={jest.fn()}
      />,
    );
    expect(
      screen.getByText(
        "Could not find location info. Please update the calendar event.",
      ),
    ).toBeTruthy();
  });
});
