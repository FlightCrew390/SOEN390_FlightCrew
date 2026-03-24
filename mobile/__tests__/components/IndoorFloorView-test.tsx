import { fireEvent, render, screen } from "@testing-library/react-native";
import { Image } from "react-native";
import React from "react";

import IndoorFloorView from "../../src/components/LocationScreen/IndoorFloorView";
import { Building, StructureType } from "../../src/types/Building";
import { IndoorRoom } from "../../src/types/IndoorRoom";
import { RouteInfo } from "../../src/types/Directions";

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
          instruction: "Walk straight",
          distanceMeters: 10,
          maneuver: "STRAIGHT",
          durationSeconds: 5,
          coordinates: [],
        },
        {
          instruction: "Go down stairs",
          distanceMeters: 5,
          maneuver: "TURN_RIGHT",
          durationSeconds: 5,
          coordinates: [],
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

      // Go outside button
      expect(screen.getByText("Go Outside")).toBeTruthy();

      // Floor transitions
      const nextFloorBtn = screen.getByText("Continue to Floor 8F");
      expect(nextFloorBtn).toBeTruthy();
      fireEvent.press(nextFloorBtn);

      // Show steps
      const toggle = screen.getByLabelText("Expand indoor directions");
      fireEvent.press(toggle);
      expect(screen.getByText("Walk straight")).toBeTruthy();
      expect(screen.getByText("Go down stairs")).toBeTruthy();

      // Hide steps
      fireEvent.press(toggle);
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

      expect(screen.getByText("Back to Floor 9F")).toBeTruthy();

      // Click transition button
      fireEvent.press(screen.getByText("Back to Floor 9F"));
      expect(props.onFloorChange).toHaveBeenCalledWith(9);
    });

    it("renders pure indoor route steps", () => {
      const indoorOnlyRoute: RouteInfo = {
        durationSeconds: 100,
        distanceMeters: 50,
        steps: [
          {
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
      const toggle = screen.getByLabelText("Expand indoor directions");
      fireEvent.press(toggle);
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

      expect(screen.getByText("Continue to Floor S2")).toBeTruthy();
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

    it("covers CC and VE map logic", () => {
      renderView({
        currentFloor: 1,
        buildingId: "CC",
        selectedRoom: { ...selectedRoom, buildingId: "CC", floor: 1 },
      });
      expect(screen.getByTestId("svg-uri")).toBeTruthy();

      renderView({
        currentFloor: 1,
        buildingId: "VE",
        selectedRoom: { ...selectedRoom, buildingId: "VE", floor: 1 },
      });
      expect(screen.getByTestId("svg-uri")).toBeTruthy();
    });
  });
});
