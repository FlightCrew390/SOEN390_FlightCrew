import { fireEvent, render, screen } from "@testing-library/react-native";
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
    end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Ends in 2 hours
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

  it("renders list of events and highlights upcoming event", () => {
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
    expect(screen.getByText("Morning Meeting")).toBeTruthy();
    expect(screen.getByText("Lunch with Sarah")).toBeTruthy();

    // The first event should be highlighted as upcoming
    const morningMeeting = screen.getByTestId("event-1");
    expect(morningMeeting.props.style).toContainEqual(
      expect.objectContaining({ borderColor: "#ff0000" }),
    );

    // Simulate pressing the event
    fireEvent.press(morningMeeting);
    expect(mockOnPress).toHaveBeenCalledWith(mockEvents[0]);
  });
});
