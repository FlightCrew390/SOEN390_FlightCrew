import React from "react";
import { render, screen } from "@testing-library/react-native";
import IndoorFloorView from "../IndoorFloorView";

// --- mocks ---------------------------------------------------------------

jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View, TouchableOpacity } = require("react-native");
  return {
    Gesture: {
      Pan: () => ({
        onStart: () => ({ onUpdate: () => ({}) }),
      }),
      Pinch: () => ({
        onStart: () => ({ onUpdate: () => ({}) }),
      }),
      Simultaneous: () => ({}),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, { testID: "gesture-detector" }, children),
    TouchableOpacity: TouchableOpacity,
  };
});

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    SvgUri: () => React.createElement(View, { testID: "svg-uri" }),
    Polyline: () => React.createElement(View, null),
    Path: () => React.createElement(View, null),
    Svg: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock(
  "@expo/vector-icons/MaterialCommunityIcons",
  () => "MaterialCommunityIcons",
);
jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

jest.mock("../../../constants", () => ({
  API_CONFIG: { getBaseUrl: () => "http://localhost:3000" },
  COLORS: {
    concordiaMaroon: "#912338",
    white: "#ffffff",
  },
}));

// -------------------------------------------------------------------------

const defaultBuilding = {
  buildingCode: "Hall",
  name: "Henry F. Hall",
  campus: "SGW",
  coordinates: { latitude: 45.497, longitude: -73.578 },
} as any;

function renderFloorView(overrides: Record<string, unknown> = {}) {
  return render(
    <IndoorFloorView
      building={defaultBuilding}
      buildingId="Hall"
      floors={[1, 2, 8, 9]}
      currentFloor={1}
      onFloorChange={jest.fn()}
      onBack={jest.fn()}
      onRoomPress={jest.fn()}
      selectedRoom={null}
      route={null}
      {...overrides}
    />,
  );
}

// -------------------------------------------------------------------------

describe("IndoorFloorView — indoor POI pins", () => {
  it("renders washroom pin for Hall floor 1 (has x/y)", () => {
    renderFloorView({ buildingId: "Hall", currentFloor: 1 });
    expect(screen.getByTestId("indoor-poi-pin-H-washroom-1")).toBeTruthy();
  });

  it("renders fountain pin for Hall floor 1 (has x/y)", () => {
    renderFloorView({ buildingId: "Hall", currentFloor: 1 });
    expect(screen.getByTestId("indoor-poi-pin-H-fountain-1")).toBeTruthy();
  });

  it("renders washroom pin for Hall floor 8 (has x/y)", () => {
    renderFloorView({ buildingId: "Hall", currentFloor: 8 });
    expect(screen.getByTestId("indoor-poi-pin-H-washroom-8")).toBeTruthy();
  });

  it("does not render a pin for H-fountain-5 (no x/y defined)", () => {
    renderFloorView({ buildingId: "Hall", currentFloor: 5 });
    expect(screen.queryByTestId("indoor-poi-pin-H-fountain-5")).toBeNull();
  });

  it("does not render floor 1 pins when viewing floor 8", () => {
    renderFloorView({ buildingId: "Hall", currentFloor: 8 });
    expect(screen.queryByTestId("indoor-poi-pin-H-washroom-1")).toBeNull();
    expect(screen.queryByTestId("indoor-poi-pin-H-fountain-1")).toBeNull();
  });

  it("renders no POI pins for a building not in BUILDING_ID_TO_POI_CODE (VL)", () => {
    renderFloorView({ buildingId: "VL", currentFloor: 1 });
    expect(screen.queryByTestId(/^indoor-poi-pin-/)).toBeNull();
  });
});
