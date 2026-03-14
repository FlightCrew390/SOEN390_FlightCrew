import { render, screen, fireEvent } from "@testing-library/react-native";
import PoiMarker from "../../src/components/LocationScreen/PoiMarker";
import { PointOfInterest } from "../../src/types/PointOfInterest";

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

const mockShowCallout = jest.fn();
const mockHideCallout = jest.fn();
const mockOnPress = jest.fn();
const mockOnDirectionPress = jest.fn();

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require("react-native");
  const MarkerComponent = React.forwardRef(
    (
      {
        children,
        testID,
        coordinate,
        title,
        description,
        onPress,
        onCalloutPress,
      }: any,
      ref: any,
    ) => {
      React.useImperativeHandle(ref, () => ({
        showCallout: mockShowCallout,
        hideCallout: mockHideCallout,
      }));
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

const mockPoi: PointOfInterest = {
  name: "Café Gentile",
  category: "cafe",
  campus: "SGW",
  address: "4126 Ste-Catherine St W",
  latitude: 45.496,
  longitude: -73.5795,
  description: "Italian-style café",
};

describe("PoiMarker", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockShowCallout.mockClear();
    mockHideCallout.mockClear();
    mockOnPress.mockClear();
    mockOnDirectionPress.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders a marker with testID", () => {
    render(<PoiMarker poi={mockPoi} />);
    expect(screen.getByTestId("poi-marker")).toBeTruthy();
  });

  it("shows the POI name as native callout title", () => {
    render(<PoiMarker poi={mockPoi} />);
    expect(screen.getByTestId("marker-title")).toHaveTextContent(
      "Café Gentile",
    );
  });

  it("shows the POI address as native callout description", () => {
    render(<PoiMarker poi={mockPoi} />);
    expect(screen.getByTestId("marker-description")).toHaveTextContent(
      "4126 Ste-Catherine St W",
    );
  });

  it("renders pure SVG marker (no View wrapper)", () => {
    render(<PoiMarker poi={mockPoi} />);
    expect(screen.getByTestId("svg-marker")).toBeTruthy();
  });

  it("renders SVG category paths for cafe", () => {
    render(<PoiMarker poi={mockPoi} />);
    // Cafe has a coffee-cup Path starting with "M15 12"
    expect(screen.getByTestId("path-M15 12")).toBeTruthy();
  });

  it("renders SVG category paths for restaurant", () => {
    const poi = { ...mockPoi, category: "restaurant" as const };
    render(<PoiMarker poi={poi} />);
    // Restaurant has knife/fork Paths starting with "M16 10"
    expect(screen.getAllByTestId("path-M16 10").length).toBeGreaterThanOrEqual(
      1,
    );
  });

  it("renders SVG category paths for pharmacy", () => {
    const poi = { ...mockPoi, category: "pharmacy" as const };
    render(<PoiMarker poi={poi} />);
    // Pharmacy has a cross Path starting with "M18 12"
    expect(screen.getByTestId("path-M18 12")).toBeTruthy();
  });

  it("renders SVG category paths for bar", () => {
    const poi = { ...mockPoi, category: "bar" as const };
    render(<PoiMarker poi={poi} />);
    // Bar has a martini Path starting with "M14 10"
    expect(screen.getByTestId("path-M14 10")).toBeTruthy();
  });

  it("renders SVG category paths for grocery", () => {
    const poi = { ...mockPoi, category: "grocery" as const };
    render(<PoiMarker poi={poi} />);
    // Grocery has a bag Path starting with "M15 14"
    expect(screen.getByTestId("path-M15 14")).toBeTruthy();
  });

  it("auto-shows callout after timeout", () => {
    render(<PoiMarker poi={mockPoi} />);
    expect(mockShowCallout).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(mockShowCallout).toHaveBeenCalledTimes(1);
  });

  it("does not auto-show callout when directions are open", () => {
    render(<PoiMarker poi={mockPoi} isDirectionsOpen={true} />);
    jest.advanceTimersByTime(1000);
    expect(mockShowCallout).not.toHaveBeenCalled();
  });

  it("hides callout when directions open", () => {
    const { rerender } = render(
      <PoiMarker poi={mockPoi} isDirectionsOpen={false} />,
    );
    expect(mockHideCallout).not.toHaveBeenCalled();
    rerender(<PoiMarker poi={mockPoi} isDirectionsOpen={true} />);
    expect(mockHideCallout).toHaveBeenCalledTimes(1);
  });

  it("still renders SVG icon when directions are open", () => {
    render(<PoiMarker poi={mockPoi} isDirectionsOpen={true} />);
    expect(screen.getByTestId("svg-marker")).toBeTruthy();
    expect(screen.getByTestId("poi-marker")).toBeTruthy();
  });
});
