import { fireEvent, render, screen } from "@testing-library/react-native";
import { Alert, Image } from "react-native";
import React from "react";

import IndoorFloorView from "../../src/components/LocationScreen/IndoorFloorView";
import { Building, StructureType } from "../../src/types/Building";
import { IndoorRoom } from "../../src/types/IndoorRoom";
import { RouteInfo } from "../../src/types/Directions";

jest.spyOn(Alert, "alert").mockImplementation(() => {});

jest.mock("@expo/vector-icons/MaterialCommunityIcons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockedIcon = (props: any) => (
    <Text testID={`mci-${props.name}`} {...props}>
      {props.name}
    </Text>
  );
  MockedIcon.displayName = "MaterialCommunityIcons";
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

jest.mock("react-native-gesture-handler", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TouchableOpacity } = require("react-native");
  const mockGesture = () => ({
    onStart() {
      return this;
    },
    onUpdate() {
      return this;
    },
  });

  return {
    GestureDetector: ({ children }: { children: any }) => children,
    Gesture: {
      Pinch: jest.fn(() => mockGesture()),
      Pan: jest.fn(() => mockGesture()),
      Simultaneous: jest.fn(() => ({})),
    },
    TouchableOpacity: TouchableOpacity,
  };
});

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: { View },
    useSharedValue: (initial: number) => ({ value: initial }),
    useAnimatedStyle: (cb: () => object) => cb(),
  };
});

jest.mock("react-native-svg", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");

  const Svg = ({ children }: any) => (
    <View testID="svg-wrapper">{children}</View>
  );
  return {
    __esModule: true,
    default: Svg,
    Svg,
    Polyline: (props: any) => <Text testID="svg-polyline">{props.points}</Text>,
    SvgUri: (props: any) => <Text testID="svg-uri">{props.uri}</Text>,
    Path: (props: any) => <View testID="svg-path" {...props} />,
  };
});

jest.mock("../../src/constants", () => ({
  API_CONFIG: {
    getBaseUrl: () => "http://localhost:8080",
  },
  COLORS: {
    concordiaMaroon: "#8b2020",
    concordiaYellow: "#ffd100",
  },
}));

const building: Building = {
  structureType: StructureType.Building,
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.4973,
  longitude: -73.5789,
  accessibilityInfo: "N/A",
};

const selectedRoom: IndoorRoom = {
  id: "h-920",
  type: "room",
  buildingId: "Hall",
  floor: 9,
  x: 100,
  y: 200,
  label: "H-920",
  accessible: true,
};

interface Props {
  buildingId?: string;
  floors?: number[];
  currentFloor?: number;
  selectedRoom?: IndoorRoom | null;
  onFloorChange?: (floor: number) => void;
  onBack?: () => void;
  route?: RouteInfo | null;
  onStepPress?: (index: number) => void;
}

function renderView(overrides: Props = {}) {
  const props = {
    building,
    buildingId: "Hall",
    floors: [1, 2, 8, 9],
    currentFloor: 9,
    onFloorChange: jest.fn(),
    onBack: jest.fn(),
    onRoomPress: jest.fn(),
    selectedRoom: null,
    ...overrides,
  };

  return {
    ...render(<IndoorFloorView {...props} />),
    props,
  };
}

describe("IndoorFloorView", () => {
  it("renders building title and current floor subtitle", () => {
    renderView();

    expect(screen.getByText("Hall")).toBeTruthy();
    expect(screen.getByText("Indoor view · Floor 9F")).toBeTruthy();
  });

  it("shows selected room label when selected room is on current floor", () => {
    renderView({ selectedRoom });

    expect(screen.getByText("Indoor view · Floor 9F · H-920")).toBeTruthy();
  });

  it("calls onBack from header back button and outdoor toggle", () => {
    const { props } = renderView();

    fireEvent.press(screen.getByLabelText("Back to building info"));
    fireEvent.press(screen.getByLabelText("Switch to outdoor map"));

    expect(props.onBack).toHaveBeenCalledTimes(2);
  });

  it("opens floor selector and changes floor", () => {
    const onFloorChange = jest.fn();
    renderView({ onFloorChange });

    fireEvent.press(screen.getByLabelText("Select floor"));
    fireEvent.press(screen.getByLabelText("Floor 1"));

    expect(onFloorChange).toHaveBeenCalledWith(1);
  });

  it("renders MB second-floor label as S2", () => {
    renderView({
      buildingId: "MB",
      floors: [1, 2],
      currentFloor: 2,
    });

    expect(screen.getByText("Indoor view · Floor S2")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Select floor"));
    expect(screen.getByText("S2")).toBeTruthy();
  });

  it("shows no floor plan message when no asset exists", () => {
    renderView({ buildingId: "UNKNOWN" });

    expect(screen.getByText("No floor plan available.")).toBeTruthy();
  });

  describe("with route", () => {
    const mockRoute: RouteInfo = {
      durationSeconds: 100,
      distanceMeters: 50,
      coordinates: [
        { latitude: 45.4973, longitude: -73.5789 },
        { latitude: 45.4975, longitude: -73.579 },
      ],
      steps: [],
      indoorPathOrigin: [
        {
          id: "h-9-entry_exit",
          buildingId: "Hall",
          floor: 9,
          x: 10,
          y: 10,
          type: "entry_exit",
        } as unknown as IndoorRoom,
        {
          id: "step-1",
          buildingId: "Hall",
          floor: 9,
          x: 20,
          y: 20,
          type: "corridor",
        } as unknown as IndoorRoom,
        {
          id: "step-2",
          buildingId: "Hall",
          floor: 8,
          x: 20,
          y: 20,
          type: "stairs",
        } as unknown as IndoorRoom,
        {
          id: "h-8-entry_exit",
          buildingId: "Hall",
          floor: 8,
          x: 30,
          y: 30,
          type: "entry_exit",
        } as unknown as IndoorRoom,
      ],
      indoorStepsOrigin: [
        {
          id: "step-1",
          instruction: "Walk straight",
          distanceMeters: 10,
          maneuver: "STRAIGHT",
          durationSeconds: 5,
          coordinates: [],
          startFloor: 9,
          endFloor: 9,
        },
        {
          id: "step-2",
          instruction: "Go down stairs",
          distanceMeters: 5,
          maneuver: "TURN_RIGHT",
          durationSeconds: 5,
          coordinates: [],
          startFloor: 9,
          endFloor: 8,
        },
      ],
    };

    it("renders route elements: path, entry/exit pins, transition pins, and indoor directions", () => {
      renderView({ route: mockRoute, currentFloor: 9, buildingId: "Hall" });

      // Path rendered
      expect(screen.getByTestId("svg-polyline")).toBeTruthy();
      expect(screen.getByTestId("svg-polyline").children.join("")).toContain(
        "5,5 10,10",
      ); // Hall map divides by 2

      // Transition pins (elevator-up is used for next regardless of direction in current implementation)
      const elevatorUp = screen.getByTestId("mci-elevator-up");
      expect(elevatorUp).toBeTruthy();

      // Floor transitions buttons are GONE
      expect(screen.queryByText("Continue to Floor 8F")).toBeNull();
    });

    it("triggers step press when a step is pressed", () => {
      // Test step click triggers onStepPress
      const onStepPress = jest.fn();
      renderView({
        route: {
          ...mockRoute,
          steps: [
            {
              id: "s1",
              instruction: "Step 1",
              startFloor: 9,
              endFloor: 9,
            } as any,
            {
              id: "s2",
              instruction: "Go down stairs",
              startFloor: 9,
              endFloor: 8,
            } as any,
          ],
        },
        currentFloor: 9,
        buildingId: "Hall",
        onStepPress,
      });

      // Find step and press it (it's in the StepsPanel)
      fireEvent.press(screen.getByText("Go down stairs"));

      // It should call onStepPress with the index of the step
      expect(onStepPress).toHaveBeenCalledWith(1);
    });

    it("renders fallback for route with indoorPath (destination side)", () => {
      const destRoute: RouteInfo = {
        ...mockRoute,
        indoorPathOrigin: undefined,
        indoorStepsOrigin: undefined,
        indoorPath: mockRoute.indoorPathOrigin,
        indoorSteps: mockRoute.indoorStepsOrigin,
      };

      const { props } = renderView({
        route: destRoute,
        currentFloor: 8,
        buildingId: "Hall",
      });

      // Old buttons are gone
      expect(screen.queryByText("Back to Floor 9F")).toBeNull();
    });

    it("renders pure indoor route steps", () => {
      const indoorOnlyRoute: RouteInfo = {
        durationSeconds: 100,
        distanceMeters: 50,
        steps: [
          {
            id: "pure-1",
            instruction: "Pure indoor step",
            distanceMeters: 10,
            maneuver: "STRAIGHT",
            durationSeconds: 5,
            coordinates: [],
          },
        ],
        indoorPath: [
          {
            id: "cc-1",
            buildingId: "CC",
            floor: 1,
            x: 10,
            y: 10,
            type: "corridor",
          } as unknown as IndoorRoom,
        ],
        coordinates: [], // pure indoor
      };

      renderView({ route: indoorOnlyRoute, currentFloor: 1, buildingId: "CC" });
      // Steps are shown automatically now, no toggle
      expect(screen.getByText("Pure indoor step")).toBeTruthy();
    });

    it("renders raster floor plan with route", () => {
      renderView({
        route: {
          ...mockRoute,
          indoorPathOrigin: [
            {
              id: "mb-1-entry",
              buildingId: "MB",
              floor: 1,
              x: 100,
              y: 100,
              type: "entry_exit",
            } as unknown as IndoorRoom,
            {
              id: "mb-s2-entry",
              buildingId: "MB",
              floor: 2,
              x: 100,
              y: 100,
              type: "entry_exit",
            } as unknown as IndoorRoom,
          ],
        },
        currentFloor: 1,
        buildingId: "MB",
        onFloorChange: jest.fn(),
      });

      // Buttons are gone
      expect(screen.queryByText("Continue to Floor S2")).toBeNull();
    });

    it("handles SvgUri onError", () => {
      renderView({ currentFloor: 9, buildingId: "Hall" });
      const svgUri = screen.getByTestId("svg-uri");
      fireEvent(svgUri, "error");
      expect(screen.getByText("Floor plan failed to load.")).toBeTruthy();
    });

    it("handles Image onError", () => {
      renderView({ currentFloor: 1, buildingId: "MB" });
      const image = screen.UNSAFE_getByType(Image);
      fireEvent(image, "error");
      expect(screen.getByText("Floor plan failed to load.")).toBeTruthy();
    });

    it("renders indoor POIs and shows Alert on press", () => {
      renderView({ currentFloor: 1, buildingId: "Hall" });

      const poiPin = screen.getByTestId("indoor-poi-pin-H-washroom-1");
      expect(poiPin).toBeTruthy();

      fireEvent.press(poiPin);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Washroom",
        "Near main entrance lobby",
      );
    });
  });

  describe("indoor POI pins", () => {
    it("renders washroom pin for Hall floor 1 (has x/y)", () => {
      renderView({ buildingId: "Hall", currentFloor: 1 });
      expect(screen.getByTestId("indoor-poi-pin-H-washroom-1")).toBeTruthy();
    });

    it("renders fountain pin for Hall floor 1 (has x/y)", () => {
      renderView({ buildingId: "Hall", currentFloor: 1 });
      expect(screen.getByTestId("indoor-poi-pin-H-fountain-1")).toBeTruthy();
    });

    it("renders washroom pin for Hall floor 8 (has x/y)", () => {
      renderView({ buildingId: "Hall", currentFloor: 8 });
      expect(screen.getByTestId("indoor-poi-pin-H-washroom-8")).toBeTruthy();
    });

    it("does not render a pin for H-fountain-5 (no x/y defined)", () => {
      renderView({ buildingId: "Hall", currentFloor: 5 });
      expect(screen.queryByTestId("indoor-poi-pin-H-fountain-5")).toBeNull();
    });

    it("does not render floor 1 pins when viewing floor 8", () => {
      renderView({ buildingId: "Hall", currentFloor: 8 });
      expect(screen.queryByTestId("indoor-poi-pin-H-washroom-1")).toBeNull();
      expect(screen.queryByTestId("indoor-poi-pin-H-fountain-1")).toBeNull();
    });

    it("renders no POI pins for a building not in BUILDING_ID_TO_POI_CODE (VL)", () => {
      renderView({ buildingId: "VL", currentFloor: 1 });
      expect(screen.queryByTestId(/^indoor-poi-pin-/)).toBeNull();
    });
  });
});
