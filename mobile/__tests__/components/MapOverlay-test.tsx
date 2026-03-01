import { render, screen } from "@testing-library/react-native";
import MapOverlays from "../../src/components/LocationScreen/MapOverlays";

// Mock styles
jest.mock("../../src/styles/GoogleMaps", () => ({
  __esModule: true,
  default: {
    loadingOverlay: {},
    loadingText: {},
    errorOverlay: {},
    errorText: {},
  },
}));

describe("MapOverlays", () => {
  // ── Loading state ──

  it("shows loading indicator when isLoading is true", () => {
    render(
      <MapOverlays isLoading={true} isBuildingsLoading={true} error={null} />,
    );
    expect(screen.getByText("Loading buildings...")).toBeTruthy();
  });

  it('shows "Loading buildings..." when isBuildingsLoading is true', () => {
    render(
      <MapOverlays isLoading={true} isBuildingsLoading={true} error={null} />,
    );
    expect(screen.getByText("Loading buildings...")).toBeTruthy();
  });

  it('shows "Getting your location..." when isBuildingsLoading is false', () => {
    render(
      <MapOverlays isLoading={true} isBuildingsLoading={false} error={null} />,
    );
    expect(screen.getByText("Getting your location...")).toBeTruthy();
  });

  it("does not show error when loading", () => {
    render(
      <MapOverlays
        isLoading={true}
        isBuildingsLoading={true}
        error="Some error"
      />,
    );
    // Loading takes priority over error
    expect(screen.queryByText("Some error")).toBeNull();
    expect(screen.getByText("Loading buildings...")).toBeTruthy();
  });

  // ── Error state ──

  it("shows error text when not loading and error is present", () => {
    render(
      <MapOverlays
        isLoading={false}
        isBuildingsLoading={false}
        error="Failed to load"
      />,
    );
    expect(screen.getByText("Failed to load")).toBeTruthy();
  });

  // ── No overlay ──

  it("renders nothing when not loading and no error", () => {
    render(
      <MapOverlays isLoading={false} isBuildingsLoading={false} error={null} />,
    );
    expect(screen.queryByTestId("map-overlay")).toBeNull();
  });

  it("renders nothing when error is empty string (falsy)", () => {
    render(
      <MapOverlays isLoading={false} isBuildingsLoading={false} error="" />,
    );
    // empty string is falsy so no error overlay
    expect(screen.queryByTestId("map-overlay")).toBeNull();
  });
});
