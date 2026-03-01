import { fireEvent, render, screen } from "@testing-library/react-native";
import MapControls from "../../src/components/LocationScreen/MapControls";

// Mock expo icons
jest.mock("@expo/vector-icons/FontAwesome5", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockIcon = (props: any) => (
    <Text testID={`icon-${props.name}`} {...props} />
  );
  MockIcon.displayName = "FontAwesome5Icon";
  return MockIcon;
});

// Mock constants and styles
jest.mock("../../src/constants", () => ({
  COLORS: { concordiaMaroon: "#8b2020" },
}));
jest.mock("../../src/styles/GoogleMaps", () => ({
  __esModule: true,
  default: {
    searchButton: {},
    searchButtonOpen: {},
    recenterButton: {},
  },
}));

describe("MapControls", () => {
  const defaultProps = {
    panel: "none" as const,
    searchOrigin: "default" as const,
    hasLocation: true,
    onOpenSearch: jest.fn(),
    onCloseSearch: jest.fn(),
    onReturnToDirections: jest.fn(),
    onRecenter: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Search button visibility ──

  it("shows search button when panel is 'none'", () => {
    render(<MapControls {...defaultProps} />);
    expect(screen.getByLabelText("Search campus buildings")).toBeTruthy();
  });

  it("shows search button when panel is 'search'", () => {
    render(<MapControls {...defaultProps} panel="search" />);
    expect(screen.getByLabelText("Close search")).toBeTruthy();
  });

  it("shows search button when panel is 'steps'", () => {
    render(<MapControls {...defaultProps} panel="steps" />);
    expect(screen.getByLabelText("Search campus buildings")).toBeTruthy();
  });

  it("hides search button when panel is 'directions'", () => {
    render(<MapControls {...defaultProps} panel="directions" />);
    expect(screen.queryByLabelText("Search campus buildings")).toBeNull();
    expect(screen.queryByLabelText("Close search")).toBeNull();
  });

  // ── Search button icon ──

  it("shows search icon when panel is 'none'", () => {
    render(<MapControls {...defaultProps} />);
    expect(screen.getByTestId("icon-search")).toBeTruthy();
  });

  it("shows times icon when panel is 'search' with default origin", () => {
    render(
      <MapControls {...defaultProps} panel="search" searchOrigin="default" />,
    );
    expect(screen.getByTestId("icon-times")).toBeTruthy();
  });

  it("shows chevron-left icon when panel is 'search' with directions origin", () => {
    render(
      <MapControls
        {...defaultProps}
        panel="search"
        searchOrigin="directions"
      />,
    );
    expect(screen.getByTestId("icon-chevron-left")).toBeTruthy();
  });

  // ── Search button press routing ──

  it("calls onOpenSearch when pressing search button and panel is 'none'", () => {
    render(<MapControls {...defaultProps} />);
    fireEvent.press(screen.getByLabelText("Search campus buildings"));
    expect(defaultProps.onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it("calls onCloseSearch when pressing search button and panel is 'search' with default origin", () => {
    render(
      <MapControls {...defaultProps} panel="search" searchOrigin="default" />,
    );
    fireEvent.press(screen.getByLabelText("Close search"));
    expect(defaultProps.onCloseSearch).toHaveBeenCalledTimes(1);
    expect(defaultProps.onReturnToDirections).not.toHaveBeenCalled();
  });

  it("calls onReturnToDirections when pressing search button and panel is 'search' with directions origin", () => {
    render(
      <MapControls
        {...defaultProps}
        panel="search"
        searchOrigin="directions"
      />,
    );
    fireEvent.press(screen.getByLabelText("Close search"));
    expect(defaultProps.onReturnToDirections).toHaveBeenCalledTimes(1);
    expect(defaultProps.onCloseSearch).not.toHaveBeenCalled();
  });

  // ── Recenter button ──

  it("shows recenter button when hasLocation is true", () => {
    render(<MapControls {...defaultProps} />);
    expect(screen.getByLabelText("Recenter map on my location")).toBeTruthy();
  });

  it("hides recenter button when hasLocation is false", () => {
    render(<MapControls {...defaultProps} hasLocation={false} />);
    expect(screen.queryByLabelText("Recenter map on my location")).toBeNull();
  });

  it("calls onRecenter when recenter button is pressed", () => {
    render(<MapControls {...defaultProps} />);
    fireEvent.press(screen.getByLabelText("Recenter map on my location"));
    expect(defaultProps.onRecenter).toHaveBeenCalledTimes(1);
  });

  // ── Both buttons visible simultaneously ──

  it("renders both search and recenter buttons when appropriate", () => {
    render(<MapControls {...defaultProps} panel="none" hasLocation={true} />);
    expect(screen.getByLabelText("Search campus buildings")).toBeTruthy();
    expect(screen.getByLabelText("Recenter map on my location")).toBeTruthy();
  });
});
