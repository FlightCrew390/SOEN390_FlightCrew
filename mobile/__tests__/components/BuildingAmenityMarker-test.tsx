import { render, screen } from "@testing-library/react-native";
import BuildingAmenityMarker from "../../src/components/LocationScreen/BuildingAmenityMarker";
import { IndoorPointOfInterest } from "../../src/types/IndoorPointOfInterest";

jest.mock("react-native-svg", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props: any) => <View testID="svg-marker" {...props} />,
    Circle: (props: any) => (
      <View
        testID={`circle-${props.fill ?? props.stroke ?? "default"}`}
        {...props}
      />
    ),
    Path: (props: any) => (
      <View
        testID={`path-${props.d?.substring(0, 6) ?? "unknown"}`}
        {...props}
      />
    ),
  };
});

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  const MarkerComponent = React.forwardRef(
    (
      { children, testID, coordinate, title, description, onPress }: any,
      ref: any,
    ) => {
      React.useImperativeHandle(ref, () => ({}));
      return (
        <View
          testID={testID}
          accessibilityLabel={`${coordinate.latitude},${coordinate.longitude}`}
          onTouchEnd={onPress}
        >
          {title && <Text testID="marker-title">{title}</Text>}
          {description && (
            <Text testID="marker-description">{description}</Text>
          )}
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

const makeIndoorPoi = (
  overrides: Partial<IndoorPointOfInterest> = {},
): IndoorPointOfInterest => ({
  id: "H-washroom-1",
  name: "Washroom",
  category: "washroom",
  buildingCode: "H",
  floor: 1,
  latitude: 45.497,
  longitude: -73.579,
  description: "Near main entrance lobby",
  ...overrides,
});

describe("BuildingAmenityMarker", () => {
  it("renders a marker with testID", () => {
    render(<BuildingAmenityMarker poi={makeIndoorPoi()} />);
    expect(screen.getByTestId("building-amenity-marker")).toBeTruthy();
  });

  it("shows the POI name as native callout title", () => {
    render(<BuildingAmenityMarker poi={makeIndoorPoi({ name: "Washroom" })} />);
    expect(screen.getByTestId("marker-title")).toHaveTextContent("Washroom");
  });

  it("shows floor and description as native callout description", () => {
    render(
      <BuildingAmenityMarker
        poi={makeIndoorPoi({ floor: 3, description: "Near elevator bank" })}
      />,
    );
    expect(screen.getByTestId("marker-description")).toHaveTextContent(
      /Floor 3/,
    );
    expect(screen.getByTestId("marker-description")).toHaveTextContent(
      /Near elevator bank/,
    );
  });

  it("renders SVG marker base", () => {
    render(<BuildingAmenityMarker poi={makeIndoorPoi()} />);
    expect(screen.getByTestId("svg-marker")).toBeTruthy();
  });

  it("renders correct coordinate on the marker", () => {
    render(
      <BuildingAmenityMarker
        poi={makeIndoorPoi({ latitude: 45.497, longitude: -73.579 })}
      />,
    );
    expect(
      screen.getByTestId("building-amenity-marker").props.accessibilityLabel,
    ).toBe("45.497,-73.579");
  });

  it("renders washroom SVG path", () => {
    render(
      <BuildingAmenityMarker poi={makeIndoorPoi({ category: "washroom" })} />,
    );
    expect(screen.getByTestId("path-M16 18")).toBeTruthy();
  });

  it("renders fountain SVG path", () => {
    render(
      <BuildingAmenityMarker poi={makeIndoorPoi({ category: "fountain" })} />,
    );
    expect(screen.getByTestId("path-M20 11")).toBeTruthy();
  });

  it("renders stairs SVG path", () => {
    render(
      <BuildingAmenityMarker poi={makeIndoorPoi({ category: "stairs" })} />,
    );
    expect(screen.getByTestId("path-M14 22")).toBeTruthy();
  });

  it("renders elevator SVG path", () => {
    render(
      <BuildingAmenityMarker poi={makeIndoorPoi({ category: "elevator" })} />,
    );
    expect(screen.getByTestId("path-M14 12")).toBeTruthy();
  });

  it("calls onPress when marker is tapped", () => {
    const mockOnPress = jest.fn();
    render(
      <BuildingAmenityMarker poi={makeIndoorPoi()} onPress={mockOnPress} />,
    );
    screen.getByTestId("building-amenity-marker").props.onTouchEnd();
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
