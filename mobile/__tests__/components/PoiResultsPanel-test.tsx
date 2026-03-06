import { fireEvent, render, screen } from "@testing-library/react-native";
import PoiResultsPanel from "../../src/components/LocationScreen/PoiResultsPanel";
import { PointOfInterest } from "../../src/types/PointOfInterest";

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

jest.mock("../../src/styles/PoiResultsPanel", () => ({
  __esModule: true,
  default: {
    container: {},
    header: {},
    backButton: {},
    headerContent: {},
    headerTitle: {},
    headerSubtitle: {},
    resultScroll: {},
    resultScrollContent: {},
    resultRow: {},
    resultRowOdd: {},
    resultContent: {},
    poiName: {},
    poiAddress: {},
    iconRow: {},
    iconButton: {},
    emptyContainer: {},
    emptyText: {},
    loadingContainer: {},
    loadingText: {},
    errorText: {},
  },
}));

const mockPoi: PointOfInterest = {
  name: "Café Gentile",
  category: "cafe",
  campus: "SGW",
  address: "4126 Ste-Catherine St W",
  latitude: 45.496,
  longitude: -73.5795,
  description: "Italian-style café",
};

const mockPoi2: PointOfInterest = {
  name: "Tim Hortons",
  category: "cafe",
  campus: "SGW",
  address: "1432 Guy St",
  latitude: 45.4968,
  longitude: -73.5787,
  description: "Coffee chain",
};

interface Props {
  results?: PointOfInterest[];
  loading?: boolean;
  error?: string | null;
  onBack?: () => void;
  onSelectPoi?: (poi: PointOfInterest) => void;
  onDirectionPress?: (poi: PointOfInterest) => void;
}

function renderPanel(overrides: Props = {}) {
  const props = {
    results: [mockPoi, mockPoi2],
    loading: false,
    error: null,
    onBack: jest.fn(),
    onSelectPoi: jest.fn(),
    onDirectionPress: jest.fn(),
    ...overrides,
  };
  return { ...render(<PoiResultsPanel {...props} />), props };
}

describe("PoiResultsPanel", () => {
  it("renders the panel with testID", () => {
    renderPanel();
    expect(screen.getByTestId("poi-results-panel")).toBeTruthy();
  });

  it("shows category title based on results", () => {
    renderPanel();
    expect(screen.getByText("Cafes")).toBeTruthy();
  });

  it("shows result count", () => {
    renderPanel();
    expect(screen.getByText("2 results")).toBeTruthy();
  });

  it("shows singular result count", () => {
    renderPanel({ results: [mockPoi] });
    expect(screen.getByText("1 result")).toBeTruthy();
  });

  it("renders POI names and addresses", () => {
    renderPanel();
    expect(screen.getByText("Café Gentile")).toBeTruthy();
    expect(screen.getByText("4126 Ste-Catherine St W")).toBeTruthy();
    expect(screen.getByText("Tim Hortons")).toBeTruthy();
    expect(screen.getByText("1432 Guy St")).toBeTruthy();
  });

  it("calls onBack when back button is pressed", () => {
    const { props } = renderPanel();
    fireEvent.press(screen.getByLabelText("Back to search"));
    expect(props.onBack).toHaveBeenCalled();
  });

  it("calls onSelectPoi when pin icon is pressed", () => {
    const { props } = renderPanel();
    const pinButtons = screen.getAllByLabelText(/Show .* on map/);
    fireEvent.press(pinButtons[0]);
    expect(props.onSelectPoi).toHaveBeenCalledWith(mockPoi);
  });

  it("calls onDirectionPress when directions icon is pressed", () => {
    const { props } = renderPanel();
    const dirButtons = screen.getAllByLabelText(/Get directions to/);
    fireEvent.press(dirButtons[0]);
    expect(props.onDirectionPress).toHaveBeenCalledWith(mockPoi);
  });

  it("shows empty state when no results", () => {
    renderPanel({ results: [] });
    expect(screen.getByText("No results found.")).toBeTruthy();
  });

  it("shows loading state", () => {
    renderPanel({ loading: true });
    expect(screen.getByText("Searching…")).toBeTruthy();
  });

  it("shows error message", () => {
    renderPanel({ error: "Network error" });
    expect(screen.getByText("Network error")).toBeTruthy();
  });

  // ── Category label mapping ──

  it("shows Restaurants title for restaurant category", () => {
    const poi: PointOfInterest = { ...mockPoi, category: "restaurant" };
    renderPanel({ results: [poi] });
    expect(screen.getByText("Restaurants")).toBeTruthy();
  });

  it("shows Pharmacies title for pharmacy category", () => {
    const poi: PointOfInterest = { ...mockPoi, category: "pharmacy" };
    renderPanel({ results: [poi] });
    expect(screen.getByText("Pharmacies")).toBeTruthy();
  });

  it("shows Bars title for bar category", () => {
    const poi: PointOfInterest = { ...mockPoi, category: "bar" };
    renderPanel({ results: [poi] });
    expect(screen.getByText("Bars")).toBeTruthy();
  });

  it("shows Groceries title for grocery category", () => {
    const poi: PointOfInterest = { ...mockPoi, category: "grocery" };
    renderPanel({ results: [poi] });
    expect(screen.getByText("Groceries")).toBeTruthy();
  });

  it("shows Results title for unknown category", () => {
    const poi = { ...mockPoi, category: "unknown" as any };
    renderPanel({ results: [poi] });
    expect(screen.getByText("Results")).toBeTruthy();
  });

  it("shows Results title when results are empty", () => {
    renderPanel({ results: [] });
    expect(screen.getByText("Results")).toBeTruthy();
  });

  it("calls onSelectPoi for second result", () => {
    const { props } = renderPanel();
    const pinButtons = screen.getAllByLabelText(/Show .* on map/);
    fireEvent.press(pinButtons[1]);
    expect(props.onSelectPoi).toHaveBeenCalledWith(mockPoi2);
  });

  it("calls onDirectionPress for second result", () => {
    const { props } = renderPanel();
    const dirButtons = screen.getAllByLabelText(/Get directions to/);
    fireEvent.press(dirButtons[1]);
    expect(props.onDirectionPress).toHaveBeenCalledWith(mockPoi2);
  });
});
