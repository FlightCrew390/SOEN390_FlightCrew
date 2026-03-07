import { fireEvent, render, screen } from "@testing-library/react-native";
import Calendar from "../../src/components/HomeScreen/Calendar";
import { CalendarEvent } from "../../src/types/CalendarEvent";

// ── Mocks ──

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

jest.mock("../../src/constants", () => ({
  COLORS: {
    concordiaMaroon: "#9C2D2D",
    white: "#fff",
    textTertiary: "#888",
  },
}));

jest.mock("../../src/styles/Calendar", () => ({
  __esModule: true,
  default: {
    container: {},
    panel: {},
    title: {},
    headerRow: {},
    monthText: {},
    viewFullButton: {},
    viewFullButtonActive: {},
    viewFullButtonText: {},
    viewFullButtonTextActive: {},
    viewFullIcon: {},
    weekContainer: {},
    weekContainerCompact: {},
    chevronButton: {},
    chevronLeft: {},
    chevronRight: {},
    week: {},
    dayCard: {},
    dayCardSelected: {},
    dayCardCurrent: {},
    dayDate: {},
    dayDateSelected: {},
    dayDateCurrent: {},
    dayLetter: {},
    dayLetterSelected: {},
    dayLetterCurrent: {},
    events: {},
    eventItem: {},
    eventContent: {},
    eventSummary: {},
    eventDetails: {},
    emptyText: {},
    errorText: {},
    weeklyHeaderRow: {},
    weeklyTimeGutter: {},
    weeklyDayHeaderCell: {},
    weeklyDayHeaderLetter: {},
    weeklyDayHeaderDate: {},
    weeklyGrid: {},
    weeklyTimeSlot: {},
    weeklyEvent: {},
    weeklyEventText: {},
  },
}));

jest.mock("../../src/utils/formatHelper", () => ({
  formatTime: jest.fn((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }),
}));

jest.mock("../../src/components/HomeScreen/EventDetailPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ event, onClose, onDirections }: any) => (
      <View testID="event-detail-panel">
        <Text>{event ? event.summary : "No event"}</Text>
      </View>
    ),
  };
});

jest.mock("../../src/components/HomeScreen/WeeklyGrid", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({
      weekDates,
      eventsForWeek,
      getDayLetter,
      isDateToday,
      onEventPress,
    }: any) => (
      <View testID="weekly-grid">
        <Text>Weekly View</Text>
      </View>
    ),
  };
});

// Mock hooks
let mockCalendarReturn = {
  events: [],
  loading: false,
  error: null as string | null,
  isConnected: true,
  fetchEvents: jest.fn(),
};

let mockCalendarUIReturn = {
  weekDates: [
    new Date("2024-01-14"), // Sunday
    new Date("2024-01-15"), // Monday
    new Date("2024-01-16"), // Tuesday
    new Date("2024-01-17"), // Wednesday
    new Date("2024-01-18"), // Thursday
    new Date("2024-01-19"), // Friday
    new Date("2024-01-20"), // Saturday
  ],
  currentMonth: "January 2024",
  eventsForSelectedDate: [] as CalendarEvent[],
  eventsForWeek: new Map(),
  viewMode: "daily",
  toggleViewMode: jest.fn(),
  selectedEvent: null as CalendarEvent | null,
  selectEvent: jest.fn(),
  clearSelectedEvent: jest.fn(),
  getDayLetter: (date: Date) =>
    ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
  isDateSelected: jest.fn(() => false),
  isDateToday: jest.fn(() => false),
  setSelectedDate: jest.fn(),
  navigateWeekBack: jest.fn(),
  navigateWeekForward: jest.fn(),
};

jest.mock("../../src/contexts/CalendarContext", () => ({
  useCalendar: () => mockCalendarReturn,
}));

jest.mock("../../src/hooks/useCalendarUI", () => ({
  useCalendarUI: () => mockCalendarUIReturn,
}));

jest.mock("../../src/hooks/useCalendarFetch", () => ({
  useCalendarFetch: jest.fn(),
}));

// Test data
const mockEvent: CalendarEvent = {
  id: "event-1",
  summary: "Test Event",
  description: "Test description",
  location: "Test Location",
  start: "2024-01-15T10:00:00Z",
  end: "2024-01-15T11:00:00Z",
  allDay: false,
};

const mockAllDayEvent: CalendarEvent = {
  id: "event-2",
  summary: "All Day Event",
  description: null,
  location: null,
  start: "2024-01-15T00:00:00Z",
  end: "2024-01-16T00:00:00Z",
  allDay: true,
};

describe("Calendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock objects to default state
    mockCalendarReturn = {
      events: [],
      loading: false,
      error: null,
      isConnected: true,
      fetchEvents: jest.fn(),
    };

    mockCalendarUIReturn = {
      weekDates: [
        new Date("2024-01-14"), // Sunday
        new Date("2024-01-15"), // Monday
        new Date("2024-01-16"), // Tuesday
        new Date("2024-01-17"), // Wednesday
        new Date("2024-01-18"), // Thursday
        new Date("2024-01-19"), // Friday
        new Date("2024-01-20"), // Saturday
      ],
      currentMonth: "January 2024",
      eventsForSelectedDate: [],
      eventsForWeek: new Map(),
      viewMode: "daily",
      toggleViewMode: jest.fn(),
      selectedEvent: null,
      selectEvent: jest.fn(),
      clearSelectedEvent: jest.fn(),
      getDayLetter: (date: Date) =>
        ["S", "M", "T", "W", "T", "F", "S"][date.getDay()],
      isDateSelected: jest.fn(() => false),
      isDateToday: jest.fn(() => false),
      setSelectedDate: jest.fn(),
      navigateWeekBack: jest.fn(),
      navigateWeekForward: jest.fn(),
    };
  });

  describe("rendering", () => {
    it("renders the calendar component", () => {
      render(<Calendar />);
      expect(screen.getByTestId("calendar-component")).toBeTruthy();
    });

    it("renders the title", () => {
      render(<Calendar />);
      expect(screen.getByText("My Schedule")).toBeTruthy();
    });

    it("renders the current month", () => {
      render(<Calendar />);
      expect(screen.getByText("January 2024")).toBeTruthy();
    });
  });

  describe("connection states", () => {
    it("shows connection message when not connected", () => {
      mockCalendarReturn.isConnected = false;

      render(<Calendar />);
      expect(
        screen.getByText("Connect Google Calendar to see your events"),
      ).toBeTruthy();
    });

    it("shows loading message when loading", () => {
      mockCalendarReturn.loading = true;

      render(<Calendar />);
      expect(screen.getByText("Loading events…")).toBeTruthy();
    });

    it("shows error message when there is an error", () => {
      mockCalendarReturn.error = "Failed to load events";

      render(<Calendar />);
      expect(screen.getByText("Failed to load events")).toBeTruthy();
    });
  });

  describe("events display", () => {
    it("shows no events message when connected but no events", () => {
      render(<Calendar />);
      expect(screen.getByText("No events scheduled for this day")).toBeTruthy();
    });

    it("renders events for the selected date", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockEvent];

      render(<Calendar />);
      expect(screen.getByText("Test Event")).toBeTruthy();
      expect(screen.getByTestId("event-event-1")).toBeTruthy();
    });

    it("renders all-day events correctly", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockAllDayEvent];

      render(<Calendar />);
      expect(screen.getByText("All Day Event")).toBeTruthy();
      expect(screen.getByText("All day")).toBeTruthy();
    });

    it("renders event location when present", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockEvent];

      render(<Calendar />);
      expect(screen.getByText("Test Location")).toBeTruthy();
    });

    it("sorts events by start time", () => {
      const event1: CalendarEvent = {
        ...mockEvent,
        id: "event-1",
        summary: "First Event",
        start: "2024-01-15T10:00:00Z",
      };
      const event2: CalendarEvent = {
        ...mockEvent,
        id: "event-2",
        summary: "Second Event",
        start: "2024-01-15T09:00:00Z",
      };

      mockCalendarUIReturn.eventsForSelectedDate = [event1, event2];

      render(<Calendar />);
      const events = screen.getAllByText(/Event$/);
      expect(events[0]).toHaveTextContent("Second Event"); // Earlier time first
      expect(events[1]).toHaveTextContent("First Event");
    });
  });

  describe("view modes", () => {
    it("renders daily view by default", () => {
      render(<Calendar />);
      expect(screen.getByText("Full Schedule")).toBeTruthy();
      expect(screen.queryByTestId("weekly-grid")).toBeNull();
    });

    it("renders weekly view when toggled", () => {
      mockCalendarUIReturn.viewMode = "weekly";

      render(<Calendar />);
      expect(screen.getByText("Daily View")).toBeTruthy();
      expect(screen.getByTestId("weekly-grid")).toBeTruthy();
    });

    it("calls toggleViewMode when view button is pressed", () => {
      const mockToggle = jest.fn();
      mockCalendarUIReturn.toggleViewMode = mockToggle;

      render(<Calendar />);
      const button = screen.getByText("Full Schedule");
      fireEvent.press(button);
      expect(mockToggle).toHaveBeenCalled();
    });
  });

  describe("week navigation", () => {
    it("renders week day cards in daily view", () => {
      render(<Calendar />);
      expect(screen.getByTestId("day-14")).toBeTruthy(); // 14th
      expect(screen.getByTestId("day-15")).toBeTruthy(); // 15th
    });

    it("calls navigateWeekBack when left chevron is pressed", () => {
      const mockNavigateBack = jest.fn();
      mockCalendarUIReturn.navigateWeekBack = mockNavigateBack;

      render(<Calendar />);
      const chevron = screen.getByTestId("chevron-left");
      fireEvent.press(chevron);
      expect(mockNavigateBack).toHaveBeenCalled();
    });

    it("calls navigateWeekForward when right chevron is pressed", () => {
      const mockNavigateForward = jest.fn();
      mockCalendarUIReturn.navigateWeekForward = mockNavigateForward;

      render(<Calendar />);
      const chevron = screen.getByTestId("chevron-right");
      fireEvent.press(chevron);
      expect(mockNavigateForward).toHaveBeenCalled();
    });
  });

  describe("event selection", () => {
    it("calls selectEvent when an event is pressed", () => {
      const mockSelectEvent = jest.fn();
      mockCalendarUIReturn.eventsForSelectedDate = [mockEvent];
      mockCalendarUIReturn.selectEvent = mockSelectEvent;

      render(<Calendar />);
      const eventItem = screen.getByTestId("event-event-1");
      fireEvent.press(eventItem);
      expect(mockSelectEvent).toHaveBeenCalledWith(mockEvent);
    });

    it("renders EventDetailPanel with selected event", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;

      render(<Calendar />);
      expect(screen.getByTestId("event-detail-panel")).toBeTruthy();
      expect(screen.getByText("Test Event")).toBeTruthy();
    });
  });
});
