import { render, screen } from "@testing-library/react-native";
import RoutePolyline from "../../src/components/LocationScreen/RoutePolyline";
import { makeRoute } from "../fixtures";

// Mock react-native-maps
jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    Polyline: (props: any) => <View testID="polyline" {...props} />,
  };
});

// Mock constants
jest.mock("../../src/constants", () => ({
  COLORS: { mapPolylineWalk: "#4A90D9" },
}));

describe("RoutePolyline", () => {
  it("renders nothing when route is null", () => {
    render(<RoutePolyline route={null} travelMode="WALK" />);
    expect(screen.queryByTestId("polyline")).toBeNull();
  });

  it("renders nothing when route has fewer than 2 coordinates", () => {
    const route = makeRoute({
      coordinates: [{ latitude: 45.49, longitude: -73.57 }],
    });
    render(<RoutePolyline route={route} travelMode="WALK" />);
    expect(screen.queryByTestId("polyline")).toBeNull();
  });

  it("renders nothing when route has an empty coordinates array", () => {
    const route = makeRoute({ coordinates: [] });
    render(<RoutePolyline route={route} travelMode="DRIVE" />);
    expect(screen.queryByTestId("polyline")).toBeNull();
  });

  it("renders a Polyline when route has 2+ coordinates", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="WALK" />);
    expect(screen.getByTestId("polyline")).toBeTruthy();
  });

  it("passes route coordinates to Polyline", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="DRIVE" />);
    expect(screen.getByTestId("polyline").props.coordinates).toEqual(
      route.coordinates,
    );
  });

  it("uses dashed pattern for WALK mode", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="WALK" />);
    expect(screen.getByTestId("polyline").props.lineDashPattern).toEqual([
      8, 6,
    ]);
  });

  it("uses no dash pattern for DRIVE mode", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="DRIVE" />);
    expect(
      screen.getByTestId("polyline").props.lineDashPattern,
    ).toBeUndefined();
  });

  it("uses no dash pattern for BICYCLE mode", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="BICYCLE" />);
    expect(
      screen.getByTestId("polyline").props.lineDashPattern,
    ).toBeUndefined();
  });

  it("uses no dash pattern for TRANSIT mode", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="TRANSIT" />);
    expect(
      screen.getByTestId("polyline").props.lineDashPattern,
    ).toBeUndefined();
  });

  it("sets strokeWidth to 5", () => {
    const route = makeRoute();
    render(<RoutePolyline route={route} travelMode="WALK" />);
    expect(screen.getByTestId("polyline").props.strokeWidth).toBe(5);
  });
});
