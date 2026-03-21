import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import IndoorFloorView from "../../src/components/LocationScreen/IndoorFloorView";
import { Building, StructureType } from "../../src/types/Building";
import { IndoorRoom } from "../../src/types/IndoorRoom";

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

jest.mock("react-native-svg", () => ({
  SvgUri: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Text } = require("react-native");
    return <Text testID="svg-uri">{props.uri}</Text>;
  },
}));

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
});
