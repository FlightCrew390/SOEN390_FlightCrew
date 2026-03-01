import { fireEvent, render, screen } from "@testing-library/react-native";
import BuildingLayer from "../../src/components/LocationScreen/BuildingLayer";
import { hallBuilding, libraryBuilding, loyolaBuilding } from "../fixtures";

// Mock child components
jest.mock("../../src/components/LocationScreen/BuildingPolygon", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ building }: any) => (
      <View testID={`polygon-${building.buildingCode}`} />
    ),
  };
});

jest.mock("../../src/components/LocationScreen/BuildingMarker", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Pressable, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({
      building,
      isCurrentBuilding,
      isSelected,
      isDirectionsOpen,
      onSelect,
      onDirectionPress,
    }: any) => (
      <View testID={`marker-${building.buildingCode}`}>
        <Text testID={`current-${building.buildingCode}`}>
          {String(isCurrentBuilding)}
        </Text>
        <Text testID={`selected-${building.buildingCode}`}>
          {String(isSelected)}
        </Text>
        <Text testID={`directions-open-${building.buildingCode}`}>
          {String(isDirectionsOpen)}
        </Text>
        <Pressable
          testID={`select-${building.buildingCode}`}
          onPress={onSelect}
        />
        <Pressable
          testID={`direction-${building.buildingCode}`}
          onPress={onDirectionPress}
        />
      </View>
    ),
  };
});

const buildings = [hallBuilding, libraryBuilding, loyolaBuilding];

describe("BuildingLayer", () => {
  const defaultProps = {
    buildings,
    currentBuildingCode: null as string | null,
    selectedBuildingCode: null as string | null,
    isDirectionsOpen: false,
    onSelect: jest.fn(),
    onDirectionPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ──

  it("renders a polygon for each building", () => {
    render(<BuildingLayer {...defaultProps} />);
    expect(screen.getByTestId("polygon-H")).toBeTruthy();
    expect(screen.getByTestId("polygon-LB")).toBeTruthy();
    expect(screen.getByTestId("polygon-CC")).toBeTruthy();
  });

  it("renders a marker for each building", () => {
    render(<BuildingLayer {...defaultProps} />);
    expect(screen.getByTestId("marker-H")).toBeTruthy();
    expect(screen.getByTestId("marker-LB")).toBeTruthy();
    expect(screen.getByTestId("marker-CC")).toBeTruthy();
  });

  it("renders nothing for an empty buildings array", () => {
    const { toJSON } = render(
      <BuildingLayer {...defaultProps} buildings={[]} />,
    );
    // Fragment with no children
    expect(toJSON()).toBeNull();
  });

  // ── Current building detection ──

  it("passes isCurrentBuilding=true only to the matching building", () => {
    render(<BuildingLayer {...defaultProps} currentBuildingCode="H" />);
    expect(screen.getByTestId("current-H").children[0]).toBe("true");
    expect(screen.getByTestId("current-LB").children[0]).toBe("false");
    expect(screen.getByTestId("current-CC").children[0]).toBe("false");
  });

  it("passes isCurrentBuilding=false to all when currentBuildingCode is null", () => {
    render(<BuildingLayer {...defaultProps} currentBuildingCode={null} />);
    expect(screen.getByTestId("current-H").children[0]).toBe("false");
    expect(screen.getByTestId("current-LB").children[0]).toBe("false");
  });

  // ── Selected building detection ──

  it("passes isSelected=true only to the matching building", () => {
    render(<BuildingLayer {...defaultProps} selectedBuildingCode="LB" />);
    expect(screen.getByTestId("selected-H").children[0]).toBe("false");
    expect(screen.getByTestId("selected-LB").children[0]).toBe("true");
    expect(screen.getByTestId("selected-CC").children[0]).toBe("false");
  });

  // ── Directions open flag ──

  it("passes isDirectionsOpen to all markers", () => {
    render(<BuildingLayer {...defaultProps} isDirectionsOpen={true} />);
    expect(screen.getByTestId("directions-open-H").children[0]).toBe("true");
    expect(screen.getByTestId("directions-open-LB").children[0]).toBe("true");
    expect(screen.getByTestId("directions-open-CC").children[0]).toBe("true");
  });

  // ── Callbacks ──

  it("calls onSelect with the correct building when marker select is pressed", () => {
    const onSelect = jest.fn();
    render(<BuildingLayer {...defaultProps} onSelect={onSelect} />);
    fireEvent.press(screen.getByTestId("select-LB"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(libraryBuilding);
  });

  it("calls onDirectionPress with the correct building", () => {
    const onDirectionPress = jest.fn();
    render(
      <BuildingLayer {...defaultProps} onDirectionPress={onDirectionPress} />,
    );
    fireEvent.press(screen.getByTestId("direction-H"));
    expect(onDirectionPress).toHaveBeenCalledTimes(1);
    expect(onDirectionPress).toHaveBeenCalledWith(hallBuilding);
  });

  it("calls onSelect with different buildings for different markers", () => {
    const onSelect = jest.fn();
    render(<BuildingLayer {...defaultProps} onSelect={onSelect} />);
    fireEvent.press(screen.getByTestId("select-H"));
    fireEvent.press(screen.getByTestId("select-CC"));
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenNthCalledWith(1, hallBuilding);
    expect(onSelect).toHaveBeenNthCalledWith(2, loyolaBuilding);
  });
});
