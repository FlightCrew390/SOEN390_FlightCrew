import { render } from "@testing-library/react-native";

import RoutePolyline from "../../src/components/LocationScreen/RoutePolyline";
import { COLORS } from "../../src/constants";
import { TRAVEL_MODE, TravelMode } from "../../src/types/Directions";
import { makeRoute } from "../fixtures";

jest.mock("react-native-maps", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  const PolylineMock = (props: any) =>
    React.createElement("Polyline", props, props.children);
  PolylineMock.displayName = "Polyline";
  return {
    __esModule: true,
    Polyline: PolylineMock,
  };
});

describe("RoutePolyline", () => {
  describe("rendering", () => {
    it("returns null when route is null", () => {
      const { toJSON } = render(
        <RoutePolyline route={null} travelMode={TRAVEL_MODE.WALK} />,
      );
      expect(toJSON()).toBeNull();
    });

    it("returns null when route has fewer than 2 coordinates", () => {
      const route = makeRoute({
        coordinates: [{ latitude: 45.4973, longitude: -73.5789 }],
      });
      const { toJSON } = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      expect(toJSON()).toBeNull();
    });

    it("returns null when route has empty coordinates", () => {
      const route = makeRoute({ coordinates: [] });
      const { toJSON } = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      expect(toJSON()).toBeNull();
    });

    it("renders Polyline when route has 2 or more coordinates", () => {
      const route = makeRoute();
      const { toJSON } = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      expect(toJSON()).not.toBeNull();
    });

    it("renders Polyline with correct coordinates", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.coordinates).toEqual(route.coordinates);
    });

    it("renders with strokeWidth of 5", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeWidth).toBe(5);
    });
  });

  describe("walking mode", () => {
    it("uses dark blue color for walking", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe(COLORS.mapPolylineWalk);
      expect(json.props.strokeColor).toBe("#40509F");
    });

    it("uses dotted line pattern for walking", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toEqual([8, 6]);
    });
  });

  describe("cycling mode", () => {
    it("uses orange color for cycling", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.BICYCLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe("#FF8C00");
    });

    it("uses dashed line pattern for cycling", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.BICYCLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toEqual([12, 6]);
    });
  });

  describe("shuttle mode", () => {
    it("uses concordia maroon color for shuttle", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.SHUTTLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe(COLORS.concordiaMaroon);
      expect(json.props.strokeColor).toBe("#9C2D2D");
    });

    it("uses solid line (no dash pattern) for shuttle", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.SHUTTLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toBeUndefined();
    });
  });

  describe("transit mode", () => {
    it("uses light blue color for transit", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe("#1E90FF");
    });

    it("uses solid line (no dash pattern) for transit", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toBeUndefined();
    });
  });

  describe("driving mode", () => {
    it("uses dark blue color for driving", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.DRIVE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe(COLORS.mapPolylineWalk);
      expect(json.props.strokeColor).toBe("#40509F");
    });

    it("uses solid line (no dash pattern) for driving", () => {
      const route = makeRoute();
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.DRIVE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toBeUndefined();
    });
  });

  describe("null travel mode", () => {
    it("defaults to dark blue color when travelMode is null", () => {
      const route = makeRoute();
      const view = render(<RoutePolyline route={route} travelMode={null} />);
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe(COLORS.mapPolylineWalk);
    });

    it("uses dotted line pattern when travelMode is null", () => {
      const route = makeRoute();
      const view = render(<RoutePolyline route={route} travelMode={null} />);
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toEqual([8, 6]);
    });
  });

  describe("all modes comparison", () => {
    const modes: {
      mode: TravelMode;
      color: string;
      hasDash: boolean;
      dashPattern?: number[];
    }[] = [
      {
        mode: TRAVEL_MODE.WALK,
        color: "#40509F",
        hasDash: true,
        dashPattern: [8, 6],
      },
      {
        mode: TRAVEL_MODE.BICYCLE,
        color: "#FF8C00",
        hasDash: true,
        dashPattern: [12, 6],
      },
      { mode: TRAVEL_MODE.SHUTTLE, color: "#9C2D2D", hasDash: false },
      { mode: TRAVEL_MODE.TRANSIT, color: "#1E90FF", hasDash: false },
      { mode: TRAVEL_MODE.DRIVE, color: "#40509F", hasDash: false },
    ];

    modes.forEach(({ mode, color, hasDash, dashPattern }) => {
      it(`applies correct styling for ${mode}`, () => {
        const route = makeRoute();
        const view = render(<RoutePolyline route={route} travelMode={mode} />);
        const json = view.toJSON() as any;
        expect(json.props.strokeColor).toBe(color);
        if (hasDash) {
          expect(json.props.lineDashPattern).toEqual(dashPattern);
        } else {
          expect(json.props.lineDashPattern).toBeUndefined();
        }
      });
    });
  });
});
