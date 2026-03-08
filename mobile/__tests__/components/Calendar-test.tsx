import { NavigationContainer, TabActions } from "@react-navigation/native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import Calendar from "../../src/components/HomeScreen/Calendar";
import { useCalendarFetch } from "../../src/hooks/useCalendarFetch";
import { CalendarEvent } from "../../src/types/CalendarEvent";

// ── Navigation mock ──
// Keep NavigationContainer real, but control useNavigation's dispatch
const mockDispatch = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actual = jest.requireActual("@react-navigation/native");
  return {
    ...actual,
    useNavigation: () => ({ dispatch: mockDispatch }),
  };
});

// ── Icon libraries ──
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

// ── Constants & styles ──
jest.mock("../../src/constants", () => ({
  COLORS: {
    concordiaMaroon: "#9C2D2D",
    white: "#fff",
    textTertiary: "#888",
  },
}));

const styleProxy = () => new Proxy({}, { get: () => ({}) });

jest.mock("../../src/styles/Calendar", () => ({
  __esModule: true,
  default: styleProxy(),
}));

jest.mock("../../src/styles/EventDetailPanel", () => ({
  __esModule: true,
  default: styleProxy(),
}));

// ── Utilities ──
jest.mock("../../src/utils/formatHelper", () => ({
  formatTime: jest.fn((isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }),
  formatHourLabel: jest.fn((hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const display = hour % 12 || 12;
    return `${display} ${period}`;
  }),
}));

// Animation hook used by real EventDetailPanel
jest.mock("../../src/hooks/usePanelAnimation", () => ({
  usePanelAnimation: () => ({ animatedStyle: {} }),
}));

// ── Context / hook mocks ──

let mockCalendarReturn: {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  isConnected: boolean;
  fetchEvents: jest.Mock;
};

let mockCalendarUIReturn: {
  weekDates: Date[];
  currentMonth: string;
  eventsForSelectedDate: CalendarEvent[];
  eventsForWeek: Map<number, CalendarEvent[]>;
  viewMode: string;
  toggleViewMode: jest.Mock;
  selectedEvent: CalendarEvent | null;
  selectEvent: jest.Mock;
  clearSelectedEvent: jest.Mock;
  getDayLetter: (date: Date) => string;
  isDateSelected: jest.Mock;
  isDateToday: jest.Mock;
  setSelectedDate: jest.Mock;
  navigateWeekBack: jest.Mock;
  navigateWeekForward: jest.Mock;
};

let mockIsAuthenticated: boolean;

jest.mock("../../src/contexts/CalendarContext", () => ({
  useCalendar: () => mockCalendarReturn,
}));

jest.mock("../../src/hooks/useCalendarUI", () => ({
  useCalendarUI: () => mockCalendarUIReturn,
  HOUR_SLOT_HEIGHT: 60,
  SCHEDULE_START_HOUR: 7,
  SCHEDULE_END_HOUR: 22,
}));

jest.mock("../../src/hooks/useCalendarFetch", () => ({
  useCalendarFetch: jest.fn(),
}));

jest.mock("../../src/contexts/UserContext", () => ({
  useUser: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

// ── Test data ──

const WEEK_DATES = [
  new Date("2024-01-14"), // Sunday
  new Date("2024-01-15"), // Monday
  new Date("2024-01-16"), // Tuesday
  new Date("2024-01-17"), // Wednesday
  new Date("2024-01-18"), // Thursday
  new Date("2024-01-19"), // Friday
  new Date("2024-01-20"), // Saturday
];

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

const mockEventNoLocation: CalendarEvent = {
  id: "event-3",
  summary: "No Location Event",
  description: "A meeting with no location",
  location: null,
  start: "2024-01-15T14:00:00Z",
  end: "2024-01-15T15:00:00Z",
  allDay: false,
};

// ── Helpers ──

const renderCalendar = () =>
  render(
    <NavigationContainer>
      <Calendar />
    </NavigationContainer>,
  );

const resetDefaults = () => {
  mockIsAuthenticated = true;

  mockCalendarReturn = {
    events: [],
    loading: false,
    error: null,
    isConnected: true,
    fetchEvents: jest.fn(),
  };

  mockCalendarUIReturn = {
    weekDates: WEEK_DATES,
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
};

// ── Tests ──

describe("Calendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetDefaults();
  });

  // ────────────────────────────────────────────
  // Unauthenticated early-return branch
  // ────────────────────────────────────────────

  describe("unauthenticated state", () => {
    beforeEach(() => {
      mockIsAuthenticated = false;
    });

    it("renders the calendar-component wrapper", () => {
      renderCalendar();
      expect(screen.getByTestId("calendar-component")).toBeTruthy();
    });

    it("renders the title", () => {
      renderCalendar();
      expect(screen.getByText("My Schedule")).toBeTruthy();
    });

    it("shows the connect prompt", () => {
      renderCalendar();
      expect(
        screen.getByText("Connect Google Calendar to see your events"),
      ).toBeTruthy();
    });

    it("renders the 'To Menu' button", () => {
      renderCalendar();
      expect(screen.getByText("To Menu")).toBeTruthy();
    });

    it("renders the menu icon inside the button", () => {
      renderCalendar();
      expect(screen.getByTestId("mi-menu")).toBeTruthy();
    });

    it("navigates to the menu tab when 'To Menu' is pressed", () => {
      renderCalendar();
      fireEvent.press(screen.getByText("To Menu"));

      expect(mockDispatch).toHaveBeenCalledTimes(1);
      const action = mockDispatch.mock.calls[0][0];
      expect(action).toEqual(TabActions.jumpTo("menu"));
    });

    it("has correct accessibility attributes on the menu button", () => {
      renderCalendar();
      const button = screen.getByLabelText("Go to menu to connect calendar");
      expect(button).toBeTruthy();
      expect(button.props.accessibilityRole).toBe("button");
    });

    it("does not render the header, week strip, or event content", () => {
      renderCalendar();
      expect(screen.queryByText("January 2024")).toBeNull();
      expect(screen.queryByTestId("chevron-left")).toBeNull();
      expect(screen.queryByText("Full Schedule")).toBeNull();
    });
  });

  // ────────────────────────────────────────────
  // Basic authenticated rendering
  // ────────────────────────────────────────────

  describe("rendering (authenticated)", () => {
    it("renders the calendar-component wrapper", () => {
      renderCalendar();
      expect(screen.getByTestId("calendar-component")).toBeTruthy();
    });

    it("renders the title", () => {
      renderCalendar();
      expect(screen.getByText("My Schedule")).toBeTruthy();
    });

    it("renders the current month", () => {
      renderCalendar();
      expect(screen.getByText("January 2024")).toBeTruthy();
    });

    it("does not render the unauthenticated 'To Menu' button", () => {
      renderCalendar();
      expect(screen.queryByText("To Menu")).toBeNull();
    });
  });

  // ────────────────────────────────────────────
  // useCalendarFetch integration
  // ────────────────────────────────────────────

  describe("useCalendarFetch", () => {
    it("is called with the correct dependencies on mount", () => {
      renderCalendar();
      expect(useCalendarFetch).toHaveBeenCalledWith({
        isConnected: mockCalendarReturn.isConnected,
        weekDates: WEEK_DATES,
        fetchEvents: mockCalendarReturn.fetchEvents,
        isAuthenticated: true,
      });
    });

    it("passes isConnected=false when calendar is disconnected", () => {
      mockCalendarReturn.isConnected = false;
      renderCalendar();
      expect(useCalendarFetch).toHaveBeenCalledWith(
        expect.objectContaining({ isConnected: false }),
      );
    });
  });

  // ────────────────────────────────────────────
  // Connection / loading / error states
  // ────────────────────────────────────────────

  describe("connection states", () => {
    it("shows connection message when not connected", () => {
      mockCalendarReturn.isConnected = false;
      renderCalendar();
      expect(
        screen.getByText("Connect Google Calendar to see your events"),
      ).toBeTruthy();
    });

    it("shows loading message when loading", () => {
      mockCalendarReturn.loading = true;
      renderCalendar();
      expect(screen.getByText("Loading events…")).toBeTruthy();
    });

    it("shows error message when there is an error", () => {
      mockCalendarReturn.error = "Failed to load events";
      renderCalendar();
      expect(screen.getByText("Failed to load events")).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────
  // Events display (real DailyEventList + EventItem)
  // ────────────────────────────────────────────

  describe("events display", () => {
    it("shows empty message when connected with no events", () => {
      renderCalendar();
      expect(screen.getByText("No events scheduled for this day")).toBeTruthy();
    });

    it("renders events for the selected date", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockEvent];
      renderCalendar();
      expect(screen.getByText("Test Event")).toBeTruthy();
      expect(screen.getByTestId("event-event-1")).toBeTruthy();
    });

    it("renders all-day events with 'All day' label", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockAllDayEvent];
      renderCalendar();
      expect(screen.getByText("All Day Event")).toBeTruthy();
      expect(screen.getByText("All day")).toBeTruthy();
    });

    it("renders event location when present", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockEvent];
      renderCalendar();
      expect(screen.getByText("Test Location")).toBeTruthy();
    });

    it("does not render location text when location is null", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [mockEventNoLocation];
      renderCalendar();
      expect(screen.queryByText("Test Location")).toBeNull();
    });

    it("sorts events by start time (earliest first)", () => {
      const laterEvent: CalendarEvent = {
        ...mockEvent,
        id: "later",
        summary: "Later Event",
        start: "2024-01-15T10:00:00Z",
      };
      const earlierEvent: CalendarEvent = {
        ...mockEvent,
        id: "earlier",
        summary: "Earlier Event",
        start: "2024-01-15T09:00:00Z",
      };

      mockCalendarUIReturn.eventsForSelectedDate = [laterEvent, earlierEvent];
      renderCalendar();

      const events = screen.getAllByText(/Event$/);
      expect(events[0]).toHaveTextContent("Earlier Event");
      expect(events[1]).toHaveTextContent("Later Event");
    });

    it("renders multiple events", () => {
      mockCalendarUIReturn.eventsForSelectedDate = [
        mockEvent,
        mockAllDayEvent,
        mockEventNoLocation,
      ];
      renderCalendar();
      expect(screen.getByTestId("event-event-1")).toBeTruthy();
      expect(screen.getByTestId("event-event-2")).toBeTruthy();
      expect(screen.getByTestId("event-event-3")).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────
  // View mode toggle
  // ────────────────────────────────────────────

  describe("view modes", () => {
    it("shows 'Full Schedule' button in daily mode", () => {
      renderCalendar();
      expect(screen.getByText("Full Schedule")).toBeTruthy();
    });

    it("shows the calendar-view-week icon in daily mode", () => {
      renderCalendar();
      expect(screen.getByTestId("mi-calendar-view-week")).toBeTruthy();
    });

    it("has correct accessibility label in daily mode", () => {
      renderCalendar();
      expect(screen.getByLabelText("Switch to weekly view")).toBeTruthy();
    });

    it("does not render the WeeklyGrid in daily mode", () => {
      renderCalendar();
      expect(screen.queryByTestId("weekly-grid-container")).toBeNull();
    });

    it("shows 'Daily View' button in weekly mode", () => {
      mockCalendarUIReturn.viewMode = "weekly";
      renderCalendar();
      expect(screen.getByText("Daily View")).toBeTruthy();
    });

    it("shows the view-agenda icon in weekly mode", () => {
      mockCalendarUIReturn.viewMode = "weekly";
      renderCalendar();
      expect(screen.getByTestId("mi-view-agenda")).toBeTruthy();
    });

    it("has correct accessibility label in weekly mode", () => {
      mockCalendarUIReturn.viewMode = "weekly";
      renderCalendar();
      expect(screen.getByLabelText("Switch to daily view")).toBeTruthy();
    });

    it("renders the WeeklyGrid in weekly mode", () => {
      mockCalendarUIReturn.viewMode = "weekly";
      renderCalendar();
      expect(screen.getByTestId("weekly-grid-container")).toBeTruthy();
    });

    it("calls toggleViewMode when the view button is pressed", () => {
      const mockToggle = jest.fn();
      mockCalendarUIReturn.toggleViewMode = mockToggle;
      renderCalendar();

      fireEvent.press(screen.getByText("Full Schedule"));
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  // ────────────────────────────────────────────
  // Week strip & day cards
  // ────────────────────────────────────────────

  describe("week navigation", () => {
    it("renders all seven day cards in daily view", () => {
      renderCalendar();
      for (const date of WEEK_DATES) {
        expect(screen.getByTestId(`day-${date.getDate()}`)).toBeTruthy();
      }
    });

    it("renders correct day letters on the cards", () => {
      renderCalendar();
      // Sun(S), Mon(M), Tue(T), Wed(W), Thu(T), Fri(F), Sat(S)
      expect(screen.getAllByText("S").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("M").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("W").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("F").length).toBeGreaterThanOrEqual(1);
    });

    it("hides day cards in weekly view", () => {
      mockCalendarUIReturn.viewMode = "weekly";
      renderCalendar();
      expect(screen.queryByTestId("day-14")).toBeNull();
      expect(screen.queryByTestId("day-15")).toBeNull();
    });

    it("calls setSelectedDate when a day card is pressed", () => {
      const mockSetDate = jest.fn();
      mockCalendarUIReturn.setSelectedDate = mockSetDate;
      renderCalendar();

      fireEvent.press(screen.getByTestId("day-15"));
      expect(mockSetDate).toHaveBeenCalledTimes(1);
    });

    it("calls navigateWeekBack when left chevron is pressed", () => {
      const mockBack = jest.fn();
      mockCalendarUIReturn.navigateWeekBack = mockBack;
      renderCalendar();

      fireEvent.press(screen.getByTestId("chevron-left"));
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it("calls navigateWeekForward when right chevron is pressed", () => {
      const mockForward = jest.fn();
      mockCalendarUIReturn.navigateWeekForward = mockForward;
      renderCalendar();

      fireEvent.press(screen.getByTestId("chevron-right"));
      expect(mockForward).toHaveBeenCalledTimes(1);
    });

    it("renders chevrons even in weekly view", () => {
      mockCalendarUIReturn.viewMode = "weekly";
      renderCalendar();
      expect(screen.getByTestId("chevron-left")).toBeTruthy();
      expect(screen.getByTestId("chevron-right")).toBeTruthy();
    });
  });

  // ────────────────────────────────────────────
  // Event selection from daily list
  // ────────────────────────────────────────────

  describe("event selection", () => {
    it("calls selectEvent with the event when pressed in daily view", () => {
      const mockSelect = jest.fn();
      mockCalendarUIReturn.eventsForSelectedDate = [mockEvent];
      mockCalendarUIReturn.selectEvent = mockSelect;
      renderCalendar();

      fireEvent.press(screen.getByTestId("event-event-1"));
      expect(mockSelect).toHaveBeenCalledWith(mockEvent);
    });

    it("calls selectEvent with the event when pressed in weekly view", () => {
      const mockSelect = jest.fn();
      mockCalendarUIReturn.viewMode = "weekly";
      mockCalendarUIReturn.eventsForWeek = new Map([[1, [mockEvent]]]);
      mockCalendarUIReturn.selectEvent = mockSelect;
      renderCalendar();

      fireEvent.press(screen.getByTestId("weekly-event-event-1"));
      expect(mockSelect).toHaveBeenCalledWith(mockEvent);
    });
  });

  // ────────────────────────────────────────────
  // EventDetailPanel (real component)
  // ────────────────────────────────────────────

  describe("EventDetailPanel", () => {
    it("is not visible when no event is selected", () => {
      renderCalendar();
      // Real EventDetailPanel returns null when event is null
      expect(screen.queryByText("Get Directions")).toBeNull();
      expect(screen.queryByText("Reminders")).toBeNull();
    });

    it("shows event summary when an event is selected", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;
      renderCalendar();
      // The summary appears both in the list and in the panel;
      // just confirm it's there
      expect(screen.getByText("Test Event")).toBeTruthy();
    });

    it("shows event description", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;
      renderCalendar();
      expect(screen.getByText("Test description")).toBeTruthy();
    });

    it("shows event location", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;
      renderCalendar();
      expect(screen.getByText("Test Location")).toBeTruthy();
    });

    it("does not show description when it is null", () => {
      mockCalendarUIReturn.selectedEvent = mockAllDayEvent;
      renderCalendar();
      expect(screen.queryByText("Test description")).toBeNull();
    });

    it("shows 'All day' for all-day events", () => {
      mockCalendarUIReturn.selectedEvent = mockAllDayEvent;
      renderCalendar();
      expect(screen.getByText("All day")).toBeTruthy();
    });

    it("shows the date label", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;
      renderCalendar();
      // "Monday, January 15" (locale-dependent format)
      expect(screen.getByText(/January 15/)).toBeTruthy();
    });

    it("renders reminder/alert actions", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;
      renderCalendar();
      expect(screen.getByText("Reminders")).toBeTruthy();
      expect(screen.getByText("Alert 1")).toBeTruthy();
      expect(screen.getByText("Alert 2")).toBeTruthy();
    });

    it("renders the Get Directions button", () => {
      mockCalendarUIReturn.selectedEvent = mockEvent;
      renderCalendar();
      expect(screen.getByText("Get Directions")).toBeTruthy();
    });

    it("calls clearSelectedEvent when close button is pressed", () => {
      const mockClear = jest.fn();
      mockCalendarUIReturn.selectedEvent = mockEvent;
      mockCalendarUIReturn.clearSelectedEvent = mockClear;
      renderCalendar();

      fireEvent.press(screen.getByLabelText("Close event details"));
      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });

  // ────────────────────────────────────────────
  // handleDirections (via Get Directions button)
  // ────────────────────────────────────────────

  describe("handleDirections", () => {
    it("clears the selected event and navigates to location tab", () => {
      const mockClear = jest.fn();
      mockCalendarUIReturn.selectedEvent = mockEvent;
      mockCalendarUIReturn.clearSelectedEvent = mockClear;
      renderCalendar();

      fireEvent.press(screen.getByLabelText("Get directions to this event"));

      // clearSelectedEvent should be called first
      expect(mockClear).toHaveBeenCalledTimes(1);

      // Navigation dispatched to "location" with directionsTo
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      const action = mockDispatch.mock.calls[0][0];
      expect(action).toEqual(
        TabActions.jumpTo("location", { directionsTo: "Test Location" }),
      );
    });

    it("clears selected event but does NOT navigate when location is null", () => {
      const mockClear = jest.fn();
      mockCalendarUIReturn.selectedEvent = mockEventNoLocation;
      mockCalendarUIReturn.clearSelectedEvent = mockClear;
      renderCalendar();

      fireEvent.press(screen.getByLabelText("Get directions to this event"));

      // Still clears the event
      expect(mockClear).toHaveBeenCalledTimes(1);

      // But no navigation since location is null
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it("does nothing if selectedEvent is null when button fires", () => {
      // selectedEvent must be non-null for the panel to render, but
      // the onDirections lambda guards: if (selectedEvent) ...
      // We can test this indirectly: no panel = no button = no crash.
      mockCalendarUIReturn.selectedEvent = null;
      renderCalendar();
      expect(
        screen.queryByLabelText("Get directions to this event"),
      ).toBeNull();
    });
  });

  // ────────────────────────────────────────────
  // Weekly view with events (real WeeklyGrid)
  // ────────────────────────────────────────────

  describe("weekly view", () => {
    beforeEach(() => {
      mockCalendarUIReturn.viewMode = "weekly";
    });

    it("renders the weekly grid container", () => {
      renderCalendar();
      expect(screen.getByTestId("weekly-grid-container")).toBeTruthy();
    });

    it("renders hour labels from 7 AM to 9 PM", () => {
      renderCalendar();
      expect(screen.getByText("7 AM")).toBeTruthy();
      expect(screen.getByText("12 PM")).toBeTruthy();
      expect(screen.getByText("9 PM")).toBeTruthy();
    });

    it("renders day header letters", () => {
      renderCalendar();
      // The weekly header shows letters for all 7 days
      expect(screen.getAllByText("S").length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("M").length).toBeGreaterThanOrEqual(1);
    });

    it("renders events on the grid", () => {
      mockCalendarUIReturn.eventsForWeek = new Map([[1, [mockEvent]]]);
      renderCalendar();
      expect(screen.getByTestId("weekly-event-event-1")).toBeTruthy();
    });

    it("does not render all-day events as blocks on the grid", () => {
      // WeeklyGrid filters out allDay events
      mockCalendarUIReturn.eventsForWeek = new Map([[1, [mockAllDayEvent]]]);
      renderCalendar();
      expect(screen.queryByTestId("weekly-event-event-2")).toBeNull();
    });

    it("renders events across multiple days", () => {
      const tuesdayEvent: CalendarEvent = {
        ...mockEvent,
        id: "tue-1",
        summary: "Tuesday Meeting",
        start: "2024-01-16T14:00:00Z",
        end: "2024-01-16T15:00:00Z",
      };
      mockCalendarUIReturn.eventsForWeek = new Map([
        [1, [mockEvent]],
        [2, [tuesdayEvent]],
      ]);
      renderCalendar();
      expect(screen.getByTestId("weekly-event-event-1")).toBeTruthy();
      expect(screen.getByTestId("weekly-event-tue-1")).toBeTruthy();
    });
  });
});
