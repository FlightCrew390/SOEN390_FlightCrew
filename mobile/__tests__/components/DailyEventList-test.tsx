import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import DailyEventList from "../../src/components/HomeScreen/DailyEventList";
import { CalendarEvent } from "../../src/types/CalendarEvent";

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    summary: "Morning Meeting",
    description: "Daily standup with the team",
    location: "Zoom",
    start: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 mins ago
    end: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // Ends in 30 mins
    allDay: false,
  },
  {
    id: "2",
    summary: "Lunch with Sarah",
    description: "Catch up over lunch",
    location: "Cafe Bistro",
    start: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Starts in 1 hour
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    allDay: false,
  },
];

describe("DailyEventList", () => {
  it("renders loading state", () => {
    render(
      <DailyEventList
        isConnected={true}
        loading={true}
        error={null}
        events={[]}
        isToday={true}
        onEventPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Loading events…")).toBeTruthy();
  });

  it("renders error state", () => {
    render(
      <DailyEventList
        isConnected={true}
        loading={false}
        error="Failed to load events"
        events={[]}
        isToday={true}
        onEventPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Failed to load events")).toBeTruthy();
  });

  it("renders empty state when no events", () => {
    render(
      <DailyEventList
        isConnected={true}
        loading={false}
        error={null}
        events={[]}
        isToday={true}
        onEventPress={jest.fn()}
      />,
    );
    expect(screen.getByText("No events scheduled for this day")).toBeTruthy();
  });

  it("renders list of events", () => {
    render(
      <DailyEventList
        isConnected={true}
        loading={false}
        error={null}
        events={mockEvents}
        isToday={true}
        onEventPress={jest.fn()}
      />,
    );
    expect(screen.getByText("Morning Meeting")).toBeTruthy();
    expect(screen.getByText("Lunch with Sarah")).toBeTruthy();
  });

  it("marks the next upcoming event with the next class pill", () => {
    render(
      <DailyEventList
        isConnected={true}
        loading={false}
        error={null}
        events={mockEvents}
        isToday={true}
        onEventPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Next class")).toBeTruthy();

    // event-1 ends in 30 mins so it is correctly flagged as upcoming
    const upcomingEvent = screen.getByTestId("event-1");
    const futureEvent = screen.getByTestId("event-2");
    expect(within(upcomingEvent).getByText("Next class")).toBeTruthy();
    expect(within(futureEvent).queryByText("Next class")).toBeNull();
  });

  it("does not show next class pill on later events", () => {
    render(
      <DailyEventList
        isConnected={true}
        loading={false}
        error={null}
        events={mockEvents}
        isToday={true}
        onEventPress={jest.fn()}
      />,
    );

    const futureEvent = screen.getByTestId("event-2");
    expect(within(futureEvent).queryByText("Next class")).toBeNull();
  });

  it("calls onEventPress when an event is pressed", () => {
    const mockOnPress = jest.fn();
    render(
      <DailyEventList
        isConnected={true}
        loading={false}
        error={null}
        events={mockEvents}
        isToday={true}
        onEventPress={mockOnPress}
      />,
    );

    fireEvent.press(screen.getByTestId("event-1"));
    expect(mockOnPress).toHaveBeenCalledWith(mockEvents[0]);
  });
});
