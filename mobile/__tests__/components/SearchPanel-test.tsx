import { fireEvent, render, screen } from "@testing-library/react-native";
import SearchPanel from "../../src/components/LocationScreen/SearchPanel";
import { LocationType } from "../../src/state/SearchPanelState";
import { Building } from "../../src/types/Building";
import { hallBuilding, libraryBuilding, testBuildings } from "../fixtures";

// ── Mocks ──

jest.mock("@expo/vector-icons/FontAwesome5", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockedFontAwesome5 = (props: any) => (
    <Text testID={`fa5-${props.name}`} {...props}>
      {props.name}
    </Text>
  );
  MockedFontAwesome5.displayName = "FontAwesome5";
  return MockedFontAwesome5;
});

jest.mock("../../src/hooks/usePanelAnimation", () => ({
  usePanelAnimation: () => ({
    fadeAnim: { current: 1 },
    slideAnim: { current: 0 },
    animatedStyle: { opacity: 1, transform: [{ translateY: 0 }] },
  }),
}));

// Mock useBuildings to return our test data
const mockUseBuildings = jest.fn();
jest.mock("../../src/contexts/BuildingContext", () => ({
  useBuildings: () => mockUseBuildings(),
}));

// Mock useAutocomplete — we test the real one separately
const mockUseAutocomplete = jest.fn();
jest.mock("../../src/hooks/useAutocomplete", () => ({
  useAutocomplete: (...args: any[]) => mockUseAutocomplete(...args),
}));

jest.mock("../../src/styles/SearchPanel", () => ({
  __esModule: true,
  default: {
    container: {},
    label: {},
    dropdownMenuWrapper: {},
    dropdownTrigger: {},
    dropdownTriggerOpen: {},
    dropdownTriggerText: {},
    dropdownMenu: {},
    dropdownDivider: {},
    dropdownOption: {},
    dropdownOptionSelected: {},
    dropdownOptionText: {},
    noResultsText: {},
    textInputWrapper: {},
    textInputWrapperOpen: {},
    textInputInner: {},
    clearButton: {},
    clearButtonText: {},
    autocompleteList: {},
    searchActionButton: {},
    searchActionButtonDisabled: {},
    searchActionButtonText: {},
  },
}));

// ── Helpers ──

interface Props {
  visible?: boolean;
  onClose?: () => void;
  onSearch?: (
    query: string,
    locationType: LocationType,
    radiusKm: number | null,
  ) => void;
  onSelectBuilding?: (building: Building) => void;
}

function renderSearchPanel(overrides: Props = {}) {
  const props = {
    visible: true,
    onClose: jest.fn(),
    onSearch: jest.fn(),
    onSelectBuilding: jest.fn(),
    ...overrides,
  };
  return { ...render(<SearchPanel {...props} />), props };
}

// ── Tests ──

describe("SearchPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBuildings.mockReturnValue({ buildings: testBuildings });
    mockUseAutocomplete.mockReturnValue([]);
  });

  // ── Basic rendering ──

  it("renders the location type label", () => {
    renderSearchPanel();
    expect(screen.getByText("Location type")).toBeTruthy();
  });

  it("renders Campus Building as default dropdown label", () => {
    renderSearchPanel();
    expect(screen.getByText("Campus Building")).toBeTruthy();
  });

  it("renders the search button", () => {
    renderSearchPanel();
    expect(screen.getByLabelText("Search")).toBeTruthy();
  });

  it("renders search input with building placeholder", () => {
    renderSearchPanel();
    expect(screen.getByLabelText("Search building name")).toBeTruthy();
  });

  // ── pointerEvents ──

  it("sets pointerEvents to auto when visible", () => {
    renderSearchPanel({ visible: true });
    expect(screen.getByTestId("search-panel").props.pointerEvents).toBe("auto");
  });

  it("sets pointerEvents to none when not visible", () => {
    renderSearchPanel({ visible: false });
    expect(screen.getByTestId("search-panel").props.pointerEvents).toBe("none");
  });

  // ── Dropdown interaction ──

  it("shows dropdown options when toggle is pressed", () => {
    renderSearchPanel();
    // Initially the menu items should not be visible
    expect(screen.queryByLabelText("Restaurant")).toBeNull();

    fireEvent.press(screen.getByLabelText("Select location type"));
    expect(screen.getByLabelText("Campus Building")).toBeTruthy();
    expect(screen.getByLabelText("Restaurant")).toBeTruthy();
  });

  it("changes location type when an option is selected", () => {
    renderSearchPanel();
    // Open dropdown
    fireEvent.press(screen.getByLabelText("Select location type"));
    // Select cafe (POI type)
    fireEvent.press(screen.getByLabelText("Cafe"));
    // For POI types, text input should not appear; distance dropdown should
    expect(screen.getByText("Distance from location")).toBeTruthy();
  });

  // ── Text input ──

  it("shows clear button when query is non-empty", () => {
    renderSearchPanel();
    // Initially no clear button
    expect(screen.queryByLabelText("Clear search")).toBeNull();

    fireEvent.changeText(screen.getByLabelText("Search building name"), "Hall");
    expect(screen.getByLabelText("Clear search")).toBeTruthy();
  });

  it("clears query when clear button is pressed", () => {
    renderSearchPanel();
    fireEvent.changeText(screen.getByLabelText("Search building name"), "Hall");
    expect(screen.getByLabelText("Clear search")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Clear search"));
    // Clear button should disappear since query is empty
    expect(screen.queryByLabelText("Clear search")).toBeNull();
  });

  // ── Search button disabled state ──

  it("disables search button when query is empty", () => {
    renderSearchPanel();
    const btn = screen.getByLabelText("Search");
    expect(
      btn.props.accessibilityState?.disabled ?? btn.props.disabled,
    ).toBeTruthy();
  });

  it("disables search button when building type and no autocomplete results", () => {
    mockUseAutocomplete.mockReturnValue([]);
    renderSearchPanel();
    fireEvent.changeText(screen.getByLabelText("Search building name"), "zzz");
    const btn = screen.getByLabelText("Search");
    expect(
      btn.props.accessibilityState?.disabled ?? btn.props.disabled,
    ).toBeTruthy();
  });

  it("enables search button when there are autocomplete results", () => {
    mockUseAutocomplete.mockReturnValue([hallBuilding]);
    renderSearchPanel();
    fireEvent.changeText(screen.getByLabelText("Search building name"), "Hall");

    // Need to re-render since useAutocomplete mock already returns results
    const btn = screen.getByLabelText("Search");
    // The button should not be disabled
    expect(btn.props.accessibilityState?.disabled).toBeFalsy();
  });

  // ── Autocomplete list ──

  it("shows autocomplete results when typing a query", () => {
    mockUseAutocomplete.mockReturnValue([hallBuilding, libraryBuilding]);
    renderSearchPanel();
    // Focus and type
    fireEvent(screen.getByLabelText("Search building name"), "focus");
    fireEvent.changeText(
      screen.getByLabelText("Search building name"),
      "Build",
    );

    expect(screen.getByLabelText("Henry F. Hall Building")).toBeTruthy();
    expect(screen.getByLabelText("J.W. McConnell Building")).toBeTruthy();
  });

  it('shows "No buildings found." when autocomplete returns empty for typed query', () => {
    mockUseAutocomplete.mockReturnValue([]);
    renderSearchPanel();
    fireEvent(screen.getByLabelText("Search building name"), "focus");
    fireEvent.changeText(screen.getByLabelText("Search building name"), "zzz");
    expect(screen.getByText("No buildings found.")).toBeTruthy();
  });

  it("fills input when an autocomplete result is pressed", () => {
    mockUseAutocomplete.mockReturnValue([hallBuilding]);
    renderSearchPanel();
    fireEvent(screen.getByLabelText("Search building name"), "focus");
    fireEvent.changeText(screen.getByLabelText("Search building name"), "Hall");

    fireEvent.press(screen.getByLabelText("Henry F. Hall Building"));
    // After selecting, the input value should be the long name
    const input = screen.getByLabelText("Search building name");
    expect(input.props.value).toBe("Henry F. Hall Building");
  });

  // ── Search submission ──

  it("calls onSelectBuilding when search is submitted with a selected result", () => {
    mockUseAutocomplete.mockReturnValue([hallBuilding]);
    const { props } = renderSearchPanel();
    // Type and select
    fireEvent(screen.getByLabelText("Search building name"), "focus");
    fireEvent.changeText(screen.getByLabelText("Search building name"), "Hall");
    fireEvent.press(screen.getByLabelText("Henry F. Hall Building"));

    // Now press search
    fireEvent.press(screen.getByLabelText("Search"));
    expect(props.onSelectBuilding).toHaveBeenCalledWith(hallBuilding);
  });

  it("calls onSearch when submitted without a selected result (restaurant type)", () => {
    mockUseAutocomplete.mockReturnValue([]);
    const { props } = renderSearchPanel();

    // Switch to restaurant (POI type)
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Restaurant"));

    // For POI type, search is always enabled — just press search
    fireEvent.press(screen.getByLabelText("Search"));
    expect(props.onSearch).toHaveBeenCalledWith("", "restaurant", null);
  });

  it("calls onSearch via keyboard submit", () => {
    mockUseAutocomplete.mockReturnValue([hallBuilding]);
    const { props } = renderSearchPanel();

    // Building type — type and submit
    const input = screen.getByLabelText("Search building name");
    fireEvent.changeText(input, "Hall");
    // Select from autocomplete first
    fireEvent.press(screen.getByLabelText("Henry F. Hall Building"));
    fireEvent(screen.getByLabelText("Search building name"), "submitEditing");

    expect(props.onSelectBuilding).toHaveBeenCalledWith(hallBuilding);
  });

  // ── useAutocomplete called with correct args ──

  it("passes buildings, query, and locationType to useAutocomplete", () => {
    renderSearchPanel();
    expect(mockUseAutocomplete).toHaveBeenCalledWith(
      testBuildings,
      "",
      "building",
    );
  });

  it("passes updated query to useAutocomplete on change", () => {
    renderSearchPanel();
    fireEvent.changeText(screen.getByLabelText("Search building name"), "Hall");
    // Check the most recent call
    const lastCall = mockUseAutocomplete.mock.calls.at(-1);
    expect(lastCall[1]).toBe("Hall");
  });

  // ── Dropdown chevron icon ──

  it("shows chevron-down when dropdown is closed", () => {
    renderSearchPanel();
    expect(screen.getByTestId("fa5-chevron-down")).toBeTruthy();
  });

  it("shows chevron-up when dropdown is open", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    expect(screen.getByTestId("fa5-chevron-up")).toBeTruthy();
  });

  // ── POI type: radius dropdown ──

  it("shows radius dropdown when POI type is selected", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Cafe"));
    expect(screen.getByText("Distance from location")).toBeTruthy();
    expect(screen.getByText("No limit")).toBeTruthy();
  });

  it("opens radius dropdown when toggle is pressed", () => {
    renderSearchPanel();
    // Switch to POI type
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Pharmacy"));
    // Open radius dropdown
    fireEvent.press(screen.getByLabelText("Select distance radius"));
    expect(screen.getByLabelText("1 km")).toBeTruthy();
    expect(screen.getByLabelText("2 km")).toBeTruthy();
    expect(screen.getByLabelText("5 km")).toBeTruthy();
  });

  it("selects a radius value from the dropdown", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Bar"));
    // Open radius dropdown and select 2 km
    fireEvent.press(screen.getByLabelText("Select distance radius"));
    fireEvent.press(screen.getByLabelText("2 km"));
    // After selecting, the trigger should show "2 km"
    expect(screen.getByText("2 km")).toBeTruthy();
  });

  it("calls onSearch with empty query, POI type, and radius when search is pressed", () => {
    const { props } = renderSearchPanel();
    // Switch to grocery
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Grocery"));
    // Select 5 km radius
    fireEvent.press(screen.getByLabelText("Select distance radius"));
    fireEvent.press(screen.getByLabelText("5 km"));
    // Press search
    fireEvent.press(screen.getByLabelText("Search"));
    expect(props.onSearch).toHaveBeenCalledWith("", "grocery", 5);
  });

  it("enables search button for POI type even without query", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Restaurant"));
    const btn = screen.getByLabelText("Search");
    expect(btn.props.accessibilityState?.disabled).toBeFalsy();
  });

  it("hides text input when POI type is selected", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Cafe"));
    expect(screen.queryByLabelText("Search building name")).toBeNull();
  });

  it("calls onSearch with no limit radius by default for POI type", () => {
    const { props } = renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Cafe"));
    fireEvent.press(screen.getByLabelText("Search"));
    expect(props.onSearch).toHaveBeenCalledWith("", "cafe", null);
  });

  it("fires blur handler after timeout", () => {
    jest.useFakeTimers();
    renderSearchPanel();
    fireEvent(screen.getByLabelText("Search building name"), "focus");
    fireEvent(screen.getByLabelText("Search building name"), "blur");
    jest.advanceTimersByTime(250);
    jest.useRealTimers();
  });

  // ── Classroom Search ──

  it("shows classroom building dropdown and clears text when classroom type is selected", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Classroom"));

    expect(screen.getByText("Building")).toBeTruthy();
    expect(screen.getByText("All Buildings")).toBeTruthy(); // Default
    expect(screen.getByLabelText("Search classroom name")).toBeTruthy();
  });

  it("opens classroom dropdown, selects a building, and updates label", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Classroom"));

    fireEvent.press(screen.getByLabelText("Select building"));
    fireEvent.press(screen.getByLabelText("Hall"));

    expect(
      screen.getAllByText("Henry F. Hall (H) Building").length,
    ).toBeGreaterThan(0);
  });

  it("calls onSearch with query and building id when classroom is searched", () => {
    const { props } = renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Classroom"));

    fireEvent.press(screen.getByLabelText("Select building"));
    fireEvent.press(screen.getByLabelText("Hall"));

    fireEvent.changeText(screen.getByLabelText("Search classroom name"), "811");
    fireEvent.press(screen.getByLabelText("Search"));

    expect(props.onSearch).toHaveBeenCalledWith(
      "811",
      "classroom",
      null,
      "Hall",
    );
  });

  it("clears query in classroom view", () => {
    renderSearchPanel();
    fireEvent.press(screen.getByLabelText("Select location type"));
    fireEvent.press(screen.getByLabelText("Classroom"));

    fireEvent.changeText(screen.getByLabelText("Search classroom name"), "9");
    expect(screen.getByLabelText("Clear search")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Clear search"));
    expect(screen.getByLabelText("Search classroom name").props.value).toBe("");
  });
});
