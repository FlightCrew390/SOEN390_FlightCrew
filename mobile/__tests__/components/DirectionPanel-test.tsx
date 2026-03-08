import { fireEvent, render, screen } from "@testing-library/react-native";
import DirectionPanel from "../../src/components/LocationScreen/DirectionPanel";
import { Building, StructureType } from "../../src/types/Building";
import {
  DEFAULT_DEPARTURE_CONFIG,
  DepartureTimeConfig,
  RouteInfo,
  TravelMode,
} from "../../src/types/Directions";
import { hallBuilding, libraryBuilding, makeRoute } from "../fixtures";

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
  usePanelAnimation: () => ({
    fadeAnim: { current: 1 },
    slideAnim: { current: 0 },
    animatedStyle: { opacity: 1, transform: [{ translateY: 0 }] },
  }),
}));

jest.mock("../../src/constants", () => ({
  COLORS: {
    concordiaMaroon: "#8b2020",
    white: "#ffffff",
    error: "#cc0000",
  },
}));

jest.mock("../../src/styles/DirectionPanel", () => ({
  __esModule: true,
  default: {
    container: {},
    closeButton: {},
    header: {},
    headerTitle: {},
    buildingInfoRow: {},
    headerLeft: {},
    buildingName: {},
    buildingAddress: {},
    distanceText: {},
    changeStartWrapper: {},
    changeStartRow: {},
    changeStartText: {},
    changeStart: {},
    resetStartRow: {},
    resetStartText: {},
    transportRow: {},
    transportCard: {},
    transportCardActive: {},
    transportIcon: {},
    transportIconActive: {},
    transportTime: {},
    transportTimeActive: {},
    loadingRow: {},
    loadingText: {},
    errorRow: {},
    errorText: {},
    divider: {},
    viewStepsButton: {},
    viewStepsText: {},
    descriptionScroll: {},
    buildingLongName: {},
    addressRow: {},
    buildingDetail: {},
    departureWrapper: {},
    departureToggle: {},
    departureToggleText: {},
    departureToggleTime: {},
    departureOptions: {},
    departurePill: {},
    departurePillActive: {},
    departurePillText: {},
    departurePillTextActive: {},
    departureDateTimeRow: {},
    departureDateBtn: {},
    departureDateText: {},
  },
}));

// Mock image assets used by transport cards
jest.mock("../../../assets/walk.png", () => 0, { virtual: true });
jest.mock("../../../assets/bike.png", () => 0, { virtual: true });
jest.mock("../../../assets/train.png", () => 0, { virtual: true });
jest.mock("../../../assets/car.png", () => 0, { virtual: true });

const building: Building = {
  structureType: StructureType.Building,
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
};

const loyolaBuilding: Building = {
  structureType: StructureType.Building,
  campus: "LOY",
  buildingCode: "AD",
  buildingName: "Administration Building",
  buildingLongName: "Loyola Administration Building",
  address: "7141 Sherbrooke St. W.",
  latitude: 45.4582,
  longitude: -73.6405,
};

beforeEach(() => {
  jest.clearAllMocks();
});
jest.mock("../../src/utils/formatHelper", () => ({
  formatDistance: (m: number) => `${m} m`,
  formatDuration: (s: number) => `${Math.round(s / 60)} min`,
}));

// Mock TransportCard so we can track props without dealing with Image requires
jest.mock("../../src/components/LocationScreen/TransportCard", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pressable, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({
      label,
      duration,
      isActive,
      onPress,
      onSelectMode,
      mode,
    }: any) => (
      <Pressable
        testID={`transport-${label}`}
        onPress={() => {
          if (mode != null && onSelectMode != null) {
            onSelectMode(mode);
          } else {
            onPress?.();
          }
        }}
        accessibilityLabel={`Get directions by ${label}`}
        accessibilityRole="button"
      >
        <Text testID={`transport-duration-${label}`}>{duration}</Text>
        <Text testID={`transport-active-${label}`}>{String(isActive)}</Text>
      </Pressable>
    ),
  };
});

jest.mock("../../src/components/LocationScreen/RouteStatusDisplay", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ loading, error }: any) => {
      if (loading) return <Text testID="route-status">Loading...</Text>;
      if (error) return <Text testID="route-status">{error}</Text>;
      return null;
    },
  };
});

jest.mock("../../src/components/LocationScreen/StepsPanel", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ building, onBack }: any) => (
      <View testID="steps-panel">
        <Text>{building.buildingCode}</Text>
      </View>
    ),
  };
});

jest.mock(
  "../../src/components/LocationScreen/DepartureTimePicker",
  () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View, Text } = require("react-native");
    return {
      __esModule: true,
      default: ({ config }: any) => (
        <View testID="departure-time-picker">
          <Text>{config.option}</Text>
        </View>
      ),
    };
  },
);

// Asset requires
jest.mock("../../../assets/walk.png", () => 1, { virtual: true });
jest.mock("../../../assets/bike.png", () => 2, { virtual: true });
jest.mock("../../../assets/train.png", () => 3, { virtual: true });
jest.mock("../../../assets/car.png", () => 4, { virtual: true });

// ── Helpers ──

interface Props {
  visible?: boolean;
  building?: Building | null;
  startBuilding?: Building | null;
  route?: RouteInfo | null;
  routeLoading?: boolean;
  routeError?: string | null;
  travelMode?: TravelMode | null;
  onTravelModeChange?: (mode: TravelMode | null) => void;
  departureConfig?: DepartureTimeConfig;
  onDepartureConfigChange?: (config: DepartureTimeConfig) => void;
  onClose?: () => void;
  onOpenSearch?: () => void;
  onResetStart?: () => void;
  showSteps?: boolean;
  onShowSteps?: () => void;
  onHideSteps?: () => void;
}

function renderPanel(overrides: Props = {}) {
  const props = {
    visible: true,
    building: hallBuilding,
    startBuilding: null,
    route: null,
    routeLoading: false,
    routeError: null,
    travelMode: null,
    onTravelModeChange: jest.fn(),
    departureConfig: DEFAULT_DEPARTURE_CONFIG,
    onDepartureConfigChange: jest.fn(),
    onClose: jest.fn(),
    onOpenSearch: jest.fn(),
    onResetStart: jest.fn(),
    showSteps: false,
    onShowSteps: jest.fn(),
    onHideSteps: jest.fn(),
    ...overrides,
  };
  return { ...render(<DirectionPanel {...props} />), props };
}

// ── Tests ──

describe("DirectionPanel", () => {
  // ── Visibility ──

  it("renders header when visible with a building", () => {
    renderPanel();
    expect(screen.getByText("Directions")).toBeTruthy();
  });

  it("does not render building content when building is null", () => {
    renderPanel({ building: null });
    expect(screen.queryByText("Directions")).toBeNull();
  });

  it("does not render building content when showSteps is true", () => {
    const route = makeRoute();
    renderPanel({ showSteps: true, route });
    expect(screen.queryByText("Directions")).toBeNull();
  });

  // ── Close button ──

  it("shows close button when visible and not showSteps", () => {
    renderPanel();
    expect(screen.getByLabelText("Close direction panel")).toBeTruthy();
  });

  it("hides close button when showSteps is true", () => {
    const route = makeRoute();
    renderPanel({ showSteps: true, route });
    expect(screen.queryByLabelText("Close direction panel")).toBeNull();
  });

  it("hides close button when not visible", () => {
    renderPanel({ visible: false });
    expect(screen.queryByLabelText("Close direction panel")).toBeNull();
  });

  it("calls onClose when close button is pressed", () => {
    const { props } = renderPanel();
    fireEvent.press(screen.getByLabelText("Close direction panel"));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  // ── Building info ──

  it("displays building name", () => {
    renderPanel();
    expect(screen.getByText("Hall Building")).toBeTruthy();
  });

  it("displays building address", () => {
    renderPanel();
    expect(
      screen.getAllByText("1455 De Maisonneuve Blvd. W.").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("falls back to buildingCode when buildingName is null", () => {
    const building = { ...hallBuilding, buildingName: null as any };
    renderPanel({ building });
    expect(screen.getByText("H")).toBeTruthy();
  });

  // ── Distance text ──

  it("shows -- m when no route", () => {
    renderPanel({ route: null });
    expect(screen.getByText("-- m")).toBeTruthy();
  });

  it("shows formatted distance when route exists", () => {
    const route = makeRoute({ distanceMeters: 350 });
    renderPanel({ route });
    expect(screen.getByText("350 m")).toBeTruthy();
  });

  // ── Start location row ──

  it("shows current location text when no startBuilding", () => {
    renderPanel({ startBuilding: null });
    expect(
      screen.getByText("Starting from your current location"),
    ).toBeTruthy();
  });

  it("shows start building name when startBuilding is set", () => {
    renderPanel({ startBuilding: libraryBuilding });
    expect(screen.getByText("Starting at Library Building")).toBeTruthy();
  });

  it("calls onOpenSearch when change is pressed", () => {
    const { props } = renderPanel();
    fireEvent.press(
      screen.getByLabelText("Search buildings to change directions start"),
    );
    expect(props.onOpenSearch).toHaveBeenCalledTimes(1);
  });

  it("shows reset button when startBuilding is set", () => {
    renderPanel({
      startBuilding: libraryBuilding,
    });
    expect(screen.getByLabelText("Reset to current location")).toBeTruthy();
  });

  it("hides reset button when no startBuilding", () => {
    renderPanel({ startBuilding: null });
    expect(screen.queryByLabelText("Reset to current location")).toBeNull();
  });

  it("calls onResetStart when reset button is pressed", () => {
    const { props } = renderPanel({
      startBuilding: libraryBuilding,
    });
    fireEvent.press(screen.getByLabelText("Reset to current location"));
    expect(props.onResetStart).toHaveBeenCalledTimes(1);
  });

  // ── Transport cards ──

  it("renders four transport cards", () => {
    renderPanel();
    expect(screen.getByTestId("transport-Walk")).toBeTruthy();
    expect(screen.getByTestId("transport-Bike")).toBeTruthy();
    expect(screen.getByTestId("transport-Transit")).toBeTruthy();
    expect(screen.getByTestId("transport-Drive")).toBeTruthy();
  });

  it("marks the active travel mode card", () => {
    renderPanel({ travelMode: "WALK" });
    expect(screen.getByTestId("transport-active-Walk").children[0]).toBe(
      "true",
    );
    expect(screen.getByTestId("transport-active-Drive").children[0]).toBe(
      "false",
    );
  });

  it("shows formatted duration on active card with route", () => {
    const route = makeRoute({ durationSeconds: 300 });
    renderPanel({ travelMode: "WALK", route });
    expect(screen.getByTestId("transport-duration-Walk").children[0]).toBe(
      "5 min",
    );
    expect(screen.getByTestId("transport-duration-Bike").children[0]).toBe(
      "-- min",
    );
  });

  it("calls onTravelModeChange with mode when inactive card pressed", () => {
    const { props } = renderPanel({ travelMode: null });
    fireEvent.press(screen.getByTestId("transport-Walk"));
    expect(props.onTravelModeChange).toHaveBeenCalledWith("WALK");
  });

  it("calls onTravelModeChange with null when active card pressed (toggle off)", () => {
    const { props } = renderPanel({ travelMode: "WALK" });
    fireEvent.press(screen.getByTestId("transport-Walk"));
    expect(props.onTravelModeChange).toHaveBeenCalledWith(null);
  });

  // ── Route status display ──

  it("shows route loading status", () => {
    renderPanel({ routeLoading: true });
    expect(screen.getByTestId("route-status")).toBeTruthy();
  });

  it("shows route error status", () => {
    renderPanel({ routeError: "Route failed" });
    expect(screen.getByTestId("route-status").children[0]).toBe("Route failed");
  });

  // ── View steps button ──

  it("shows view steps button when route has steps", () => {
    const route = makeRoute();
    renderPanel({ route });
    expect(screen.getByLabelText("View route")).toBeTruthy();
  });

  it("calls onShowSteps when view steps is pressed", () => {
    const route = makeRoute();
    const { props } = renderPanel({ route });
    fireEvent.press(screen.getByLabelText("View route"));
    expect(props.onShowSteps).toHaveBeenCalledTimes(1);
  });

  it("does not show view steps when route has no steps and no path", () => {
    const route = makeRoute({ steps: [], coordinates: [] });
    renderPanel({ route });
    expect(screen.queryByLabelText("View route")).toBeNull();
  });

  // ── Building details (fallback when no route) ──

  it("shows building details when no route and not loading/error", () => {
    renderPanel({
      route: null,
      routeLoading: false,
      routeError: null,
    });
    expect(screen.getByText("Henry F. Hall Building")).toBeTruthy();
    expect(screen.getByText("Building Code: H")).toBeTruthy();
    expect(screen.getByText(/Sir George Williams/)).toBeTruthy();
  });

  it("shows Loyola for LOY campus building", () => {
    const loyBuilding = {
      ...hallBuilding,
      campus: "LOY",
    } as Building;
    renderPanel({
      building: loyBuilding,
      route: null,
    });
    expect(screen.getByText(/Loyola/)).toBeTruthy();
  });

  it("does not show building details when loading", () => {
    renderPanel({
      route: null,
      routeLoading: true,
    });
    expect(screen.queryByText("Henry F. Hall Building")).toBeNull();
  });

  it("does not show building details when there is an error", () => {
    renderPanel({
      route: null,
      routeError: "Failed",
    });
    expect(screen.queryByText("Henry F. Hall Building")).toBeNull();
  });

  // ── Steps panel ──

  it("renders StepsPanel when showSteps is true with building and route", () => {
    const route = makeRoute();
    renderPanel({ showSteps: true, route });
    expect(screen.getByTestId("steps-panel")).toBeTruthy();
  });

  it("does not render StepsPanel when building is null", () => {
    const route = makeRoute();
    renderPanel({
      showSteps: true,
      building: null,
      route,
    });
    expect(screen.queryByTestId("steps-panel")).toBeNull();
  });

  it("does not render StepsPanel when route is null", () => {
    renderPanel({
      showSteps: true,
      route: null,
    });
    expect(screen.queryByTestId("steps-panel")).toBeNull();
  });

  it("does not render StepsPanel when showSteps is false", () => {
    const route = makeRoute();
    renderPanel({ showSteps: false, route });
    expect(screen.queryByTestId("steps-panel")).toBeNull();
  });

  // ── pointerEvents ──

  it("sets pointerEvents to auto when visible, has building, not steps", () => {
    const { UNSAFE_root } = renderPanel();
    // The Animated.View is a child; find the one with pointerEvents
    const animView = UNSAFE_root.findAll(
      (node: any) => node.props.pointerEvents !== undefined,
    );
    const main = animView.find(
      (n: any) =>
        n.props.pointerEvents === "auto" || n.props.pointerEvents === "none",
    );
    expect(main?.props.pointerEvents).toBe("auto");
  });

  it("sets pointerEvents to none when not visible", () => {
    const { UNSAFE_root } = renderPanel({ visible: false });
    const animView = UNSAFE_root.findAll(
      (node: any) => node.props.pointerEvents !== undefined,
    );
    const main = animView.find((n: any) => n.props.pointerEvents === "none");
    expect(main).toBeTruthy();
  });
});
