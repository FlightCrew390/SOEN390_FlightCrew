import { fireEvent, render, screen } from "@testing-library/react-native";
import EventDetailPanel from "../../src/components/HomeScreen/EventDetailPanel";
import { CalendarEvent } from "../../src/types/CalendarEvent";

// ── Mocks ──

jest.mock("@expo/vector-icons/FontAwesome5", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockedIcon = (props: any) => (
    <Text testID={`fa5-${props.name}`} {...props}>
      {props.name}
    </Text>
  );
  MockedIcon.displayName = "FontAwesome5";
  return MockedIcon;
});

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockedIcon = (props: any) => (
    <Text testID={`mi-${props.name}`} {...props}>
      {props.name}
    </Text>
  );
  MockedIcon.displayName = "MaterialIcons";
  return MockedIcon;
});

jest.mock("../../src/hooks/usePanelAnimation", () => ({
  usePanelAnimation: () => ({ animatedStyle: {} }),
}));

jest.mock("../../src/constants", () => ({
  COLORS: {
    concordiaMaroon: "#9C2D2D",
    white: "#fff",
    textTertiary: "#888",
  },
}));

jest.mock("../../src/styles/EventDetailPanel", () => ({
  __esModule: true,
  default: {
    overlay: {},
    panel: {},
    infoSection: {},
    actionsSection: {},
    closeButton: {},
    eventSummary: {},
    detailRow: {},
    detailText: {},
    descriptionText: {},
    sectionLabel: {},
    alertRow: {},
    alertButton: {},
    alertButtonText: {},
    directionsButton: {},
    directionsButtonText: {},
  },
}));

jest.mock("../../src/utils/formatHelper", () => ({
  formatTime: jest.fn((iso: string) => iso),
}));

// ── Test data ──
const baseEvent: CalendarEvent = {
  id: "event-1",
  summary: "Test Event",
  description: "Some details",
  location: "Test Location",
  start: "2024-01-01T10:00:00Z",
  end: "2024-01-01T11:00:00Z",
  allDay: false,
};

describe("EventDetailPanel", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing when event is null", () => {
    render(
      <EventDetailPanel
        event={null}
        onClose={() => {}}
        onDirections={() => {}}
      />,
    );
    expect(screen.queryByText("Test Event")).toBeNull();
  });

  it("displays summary, time, date, location and description", () => {
    render(
      <EventDetailPanel
        event={baseEvent}
        onClose={() => {}}
        onDirections={() => {}}
      />,
    );

    expect(screen.getByText("Test Event")).toBeTruthy();
    expect(screen.getByText("Some details")).toBeTruthy();
    expect(screen.getByText("Test Location")).toBeTruthy();
    // times are rendered together in one string
    expect(
      screen.getByText(`${baseEvent.start} - ${baseEvent.end}`),
    ).toBeTruthy();
  });

  it("shows 'All day' label for all-day events and hides start/end times", () => {
    const allDayEvent = {
      ...baseEvent,
      allDay: true,
      start: "2024-01-01T00:00:00Z",
      end: "2024-01-02T00:00:00Z",
    };
    render(
      <EventDetailPanel
        event={allDayEvent}
        onClose={() => {}}
        onDirections={() => {}}
      />,
    );

    expect(screen.getByText("All day")).toBeTruthy();
    expect(screen.queryByText(allDayEvent.start)).toBeNull();
    expect(screen.queryByText(allDayEvent.end)).toBeNull();
  });

  it("omits location and description when they are null", () => {
    const minimalEvent = { ...baseEvent, location: null, description: null };
    render(
      <EventDetailPanel
        event={minimalEvent}
        onClose={() => {}}
        onDirections={() => {}}
      />,
    );

    expect(screen.queryByText("Test Location")).toBeNull();
    expect(screen.queryByText("Some details")).toBeNull();
  });

  it("invokes onClose when the close button is pressed", () => {
    const onClose = jest.fn();
    render(
      <EventDetailPanel
        event={baseEvent}
        onClose={onClose}
        onDirections={() => {}}
      />,
    );

    fireEvent.press(screen.getByLabelText("Close event details"));
    expect(onClose).toHaveBeenCalled();
  });

  it("invokes onDirections callback with the event when directions button pressed", () => {
    const onDirections = jest.fn();
    render(
      <EventDetailPanel
        event={baseEvent}
        onClose={() => {}}
        onDirections={onDirections}
      />,
    );

    fireEvent.press(screen.getByLabelText("Get directions to this event"));
    expect(onDirections).toHaveBeenCalledWith(baseEvent);
  });
});
