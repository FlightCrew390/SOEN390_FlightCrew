import { fireEvent, render, screen } from "@testing-library/react-native";
import RoomResultsPanel from "../../src/components/LocationScreen/RoomResultsPanel";
import { IndoorRoom } from "../../src/types/IndoorRoom";

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
  },
}));

const room1: IndoorRoom = {
  id: "h-920",
  type: "room",
  buildingId: "Hall",
  floor: 9,
  x: 100,
  y: 200,
  label: "H-920",
  accessible: true,
};

const room2: IndoorRoom = {
  id: "mb-1.210",
  type: "room",
  buildingId: "MB",
  floor: 1,
  x: 150,
  y: 260,
  label: "MB-1.210",
  accessible: true,
};

interface Props {
  results?: IndoorRoom[];
  onBack?: () => void;
  onSelectRoom?: (room: IndoorRoom) => void;
  onDirectionPress?: (room: IndoorRoom) => void;
}

function renderPanel(overrides: Props = {}) {
  const props = {
    results: [room1, room2],
    onBack: jest.fn(),
    onSelectRoom: jest.fn(),
    onDirectionPress: jest.fn(),
    ...overrides,
  };

  return {
    ...render(<RoomResultsPanel {...props} />),
    props,
  };
}

describe("RoomResultsPanel", () => {
  it("renders panel and static header", () => {
    renderPanel();

    expect(screen.getByTestId("room-results-panel")).toBeTruthy();
    expect(screen.getByText("Classrooms")).toBeTruthy();
  });

  it("shows plural count for multiple results", () => {
    renderPanel();

    expect(screen.getByText("2 results")).toBeTruthy();
  });

  it("shows singular count for one result", () => {
    renderPanel({ results: [room1] });

    expect(screen.getByText("1 result")).toBeTruthy();
  });

  it("renders room labels and mapped building names", () => {
    renderPanel();

    expect(screen.getByText("H-920")).toBeTruthy();
    expect(screen.getByText("Henry F. Hall (H) Building")).toBeTruthy();
    expect(screen.getByText("MB-1.210")).toBeTruthy();
    expect(screen.getByText("John Molson School of Business")).toBeTruthy();
  });

  it("falls back to raw building id when no mapping exists", () => {
    const unmappedRoom: IndoorRoom = {
      ...room1,
      id: "x-101",
      label: "X-101",
      buildingId: "X",
    };

    renderPanel({ results: [unmappedRoom] });

    expect(screen.getByText("X")).toBeTruthy();
  });

  it("calls onBack when pressing the back button", () => {
    const { props } = renderPanel();

    fireEvent.press(screen.getByLabelText("Back to search"));

    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onSelectRoom with the right room", () => {
    const { props } = renderPanel();

    const mapButtons = screen.getAllByLabelText(/Show .* on map/);
    fireEvent.press(mapButtons[0]);

    expect(props.onSelectRoom).toHaveBeenCalledWith(room1);
  });

  it("calls onDirectionPress with the right room", () => {
    const { props } = renderPanel();

    const directionButtons = screen.getAllByLabelText(/Get directions to/);
    fireEvent.press(directionButtons[1]);

    expect(props.onDirectionPress).toHaveBeenCalledWith(room2);
  });

  it("shows empty state when there are no results", () => {
    renderPanel({ results: [] });

    expect(screen.getByText("No classrooms found.")).toBeTruthy();
  });
});
