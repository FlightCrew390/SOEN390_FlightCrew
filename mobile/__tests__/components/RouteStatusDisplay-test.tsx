import { render, screen } from "@testing-library/react-native";
import RouteStatusDisplay from "../../src/components/LocationScreen/RouteStatusDisplay";

// Mock expo icons
jest.mock("@expo/vector-icons/FontAwesome5", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockedIcon = (props: any) => <Text testID="icon" {...props} />;
  MockedIcon.displayName = "FontAwesome5";
  return MockedIcon;
});

// Mock constants and styles
jest.mock("../../src/constants", () => ({
  COLORS: { concordiaMaroon: "#8b2020", error: "#cc0000" },
}));
jest.mock("../../src/styles/DirectionPanel", () => ({
  __esModule: true,
  default: {
    loadingRow: {},
    loadingText: {},
    errorRow: {},
    errorText: {},
  },
}));

describe("RouteStatusDisplay", () => {
  // ── Loading state ──

  it("shows loading text when loading is true", () => {
    render(<RouteStatusDisplay loading={true} error={null} />);
    expect(screen.getByText("Calculating route…")).toBeTruthy();
  });

  it("does not show error when loading is true even if error is present", () => {
    render(<RouteStatusDisplay loading={true} error="Something went wrong" />);
    // Loading takes priority
    expect(screen.getByText("Calculating route…")).toBeTruthy();
    expect(screen.queryByText("Something went wrong")).toBeNull();
  });

  // ── Error state ──

  it("shows error text when not loading and error is present", () => {
    render(<RouteStatusDisplay loading={false} error="Network error" />);
    expect(screen.getByText("Network error")).toBeTruthy();
  });

  it("renders exclamation icon on error", () => {
    render(<RouteStatusDisplay loading={false} error="Route not found" />);
    expect(screen.getByTestId("icon").props.name).toBe("exclamation-circle");
  });

  // ── No display ──

  it("renders nothing when not loading and no error", () => {
    render(<RouteStatusDisplay loading={false} error={null} />);
    expect(screen.queryByTestId("route-status-display")).toBeNull();
  });
});
