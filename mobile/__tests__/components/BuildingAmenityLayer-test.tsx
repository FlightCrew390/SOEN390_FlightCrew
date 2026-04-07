import { render, screen, waitFor } from "@testing-library/react-native";
import BuildingAmenityLayer from "../../src/components/LocationScreen/BuildingAmenityLayer";

jest.mock("../../src/services/IndoorPoiService", () => ({
  getIndoorPoisForBuilding: async (code: string) => {
    if (code === "H") {
      return [
        {
          id: "H-washroom-1",
          name: "Washroom",
          category: "washroom",
          buildingCode: "H",
          floor: 1,
          latitude: 45.497,
          longitude: -73.579,
          description: "Near main entrance lobby",
        },
        {
          id: "H-elevator-main",
          name: "Main Elevator",
          category: "elevator",
          buildingCode: "H",
          floor: 1,
          latitude: 45.4971,
          longitude: -73.579,
          description: "Accessible elevator",
        },
        {
          id: "H-fountain-1",
          name: "Water Fountain",
          category: "fountain",
          buildingCode: "H",
          floor: 1,
          latitude: 45.4969,
          longitude: -73.5789,
          description: "By the main corridor",
        },
      ];
    }
    return [];
  },
}));

jest.mock("react-native-svg", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View testID="svg-marker" {...props} />,
    Circle: (props: any) => <View {...props} />,
    Path: (props: any) => <View {...props} />,
  };
});

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  const MarkerComponent = React.forwardRef(
    ({ children, testID, coordinate }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({}));
      return (
        <View
          testID={testID}
          accessibilityLabel={`${coordinate.latitude},${coordinate.longitude}`}
        >
          {children}
        </View>
      );
    },
  );
  MarkerComponent.displayName = "Marker";
  return {
    __esModule: true,
    default: View,
    Marker: MarkerComponent,
    Callout: ({ children }: any) => <View>{children}</View>,
  };
});

describe("BuildingAmenityLayer", () => {
  it("renders nothing when buildingCode is null", () => {
    render(<BuildingAmenityLayer buildingCode={null} />);
    expect(screen.queryAllByTestId("building-amenity-marker")).toHaveLength(0);
  });

  it("renders a marker for each POI in the building", async () => {
    render(<BuildingAmenityLayer buildingCode="H" />);
    // Mock returns 3 fixtures for "H" (intentional — isolates component from data layer)
    await waitFor(() => {
      expect(screen.getAllByTestId("building-amenity-marker")).toHaveLength(3);
    });
  });

  it("renders nothing for an unknown building code", async () => {
    render(<BuildingAmenityLayer buildingCode="UNKNOWN" />);
    await waitFor(() => {
      expect(screen.queryAllByTestId("building-amenity-marker")).toHaveLength(
        0,
      );
    });
  });

  it("renders markers with correct coordinates", async () => {
    render(<BuildingAmenityLayer buildingCode="H" />);
    await waitFor(() => {
      const markers = screen.getAllByTestId("building-amenity-marker");
      expect(markers[0].props.accessibilityLabel).toBe("45.497,-73.579");
    });
  });
});
