import { render } from "@testing-library/react-native";

import RoutePolyline from "../../src/components/LocationScreen/RoutePolyline";
import { COLORS } from "../../src/constants";
import { TRAVEL_MODE } from "../../src/types/Directions";
import { makeRoute, makeStep } from "../fixtures";

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

    it("renders multiple Polyline segments (one per step)", () => {
      const route = makeRoute({
        steps: [
          makeStep({ instruction: "Walk north" }),
          makeStep({ instruction: "Turn left" }),
          makeStep({ instruction: "Walk straight" }),
        ],
      });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      // Should render 3 Polyline components (one per step)
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(3);
    });

    it("renders single Polyline segment for route with no steps", () => {
      const route = makeRoute({ steps: [] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      expect(json).not.toBeNull();
      expect(json.props).toBeDefined();
    });

    it("renders with strokeWidth of 5 for each segment", () => {
      const route = makeRoute({
        steps: [makeStep({}), makeStep({})],
      });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      json.forEach((polyline: any) => {
        expect(polyline.props.strokeWidth).toBe(5);
      });
    });
  });

  describe("cycling steps", () => {
    it("uses orange color for cycling steps", () => {
      const cycleStep = makeStep({ travelMode: "BICYCLE" });
      const route = makeRoute({ steps: [cycleStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.BICYCLE} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.strokeColor).toBe("#FF8C00");
    });

    it("uses dashed line pattern for cycling steps", () => {
      const cycleStep = makeStep({ travelMode: "BICYCLE" });
      const route = makeRoute({ steps: [cycleStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.BICYCLE} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.lineDashPattern).toEqual([12, 6]);
    });
  });

  describe("walking steps", () => {
    it("uses dark blue color for walking steps", () => {
      const walkStep = makeStep();
      const route = makeRoute({ steps: [walkStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.strokeColor).toBe("#40509F");
    });

    it("uses dotted line pattern for walking steps", () => {
      const walkStep = makeStep();
      const route = makeRoute({ steps: [walkStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.WALK} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.lineDashPattern).toEqual([8, 6]);
    });
  });

  describe("transit steps - vehicle types", () => {
    it("uses orange-red color for subway/metro steps", () => {
      const metroStep = makeStep({
        transitDetails: {
          departureStopName: "Guy-Concordia",
          arrivalStopName: "Berri-UQAM",
          departureTime: "2026-03-03T09:00:00Z",
          arrivalTime: "2026-03-03T09:15:00Z",
          lineName: "Green Line",
          lineShortName: "1",
          vehicleType: "SUBWAY",
          vehicleName: "Metro",
          stopCount: 5,
        },
      });
      const route = makeRoute({ steps: [metroStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.strokeColor).toBe("#FF6B35");
    });

    it("uses light blue color for bus steps", () => {
      const busStep = makeStep({
        transitDetails: {
          departureStopName: "Guy-Concordia",
          arrivalStopName: "Berri-UQAM",
          departureTime: "2026-03-03T09:00:00Z",
          arrivalTime: "2026-03-03T09:15:00Z",
          lineName: "105",
          lineShortName: "105",
          vehicleType: "BUS",
          vehicleName: "STM Bus",
          stopCount: 3,
        },
      });
      const route = makeRoute({ steps: [busStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.strokeColor).toBe("#1E90FF");
    });

    it("uses royal blue color for trolleybus steps", () => {
      const trolleyStep = makeStep({
        transitDetails: {
          departureStopName: "Stop A",
          arrivalStopName: "Stop B",
          departureTime: "2026-03-03T09:00:00Z",
          arrivalTime: "2026-03-03T09:15:00Z",
          lineName: "201",
          lineShortName: "201",
          vehicleType: "TROLLEYBUS",
          vehicleName: "Trolleybus",
          stopCount: 2,
        },
      });
      const route = makeRoute({ steps: [trolleyStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.strokeColor).toBe("#4169E1");
    });

    it("uses solid line for all transit steps", () => {
      const transitStep = makeStep({
        transitDetails: {
          departureStopName: "Stop A",
          arrivalStopName: "Stop B",
          departureTime: "2026-03-03T09:00:00Z",
          arrivalTime: "2026-03-03T09:15:00Z",
          lineName: "105",
          lineShortName: "105",
          vehicleType: "BUS",
          vehicleName: "Bus",
          stopCount: 2,
        },
      });
      const route = makeRoute({ steps: [transitStep] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      const polyline = Array.isArray(json) ? json[0] : json;
      expect(polyline.props.lineDashPattern).toBeUndefined();
    });
  });

  describe("mixed transit routes", () => {
    it("renders walking + bus + metro + walking with different colors and styles", () => {
      const route = makeRoute({
        steps: [
          // Walking to stop
          makeStep({ instruction: "Walk to bus stop" }),
          // Bus segment
          makeStep({
            instruction: "Take bus 105",
            transitDetails: {
              departureStopName: "Start",
              arrivalStopName: "Transfer",
              departureTime: "2026-03-03T09:00:00Z",
              arrivalTime: "2026-03-03T09:10:00Z",
              lineName: "105",
              lineShortName: "105",
              vehicleType: "BUS",
              vehicleName: "Bus",
              stopCount: 3,
            },
          }),
          // Metro segment
          makeStep({
            instruction: "Take metro line 1",
            transitDetails: {
              departureStopName: "Transfer",
              arrivalStopName: "Destination",
              departureTime: "2026-03-03T09:15:00Z",
              arrivalTime: "2026-03-03T09:25:00Z",
              lineName: "Green Line",
              lineShortName: "1",
              vehicleType: "SUBWAY",
              vehicleName: "Metro",
              stopCount: 5,
            },
          }),
          // Walking from stop
          makeStep({ instruction: "Walk to destination" }),
        ],
      });

      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.TRANSIT} />,
      );
      const json = view.toJSON() as any;
      expect(Array.isArray(json)).toBe(true);
      expect(json.length).toBe(4);

      // Walking segment (index 0)
      expect(json[0].props.strokeColor).toBe("#40509F");
      expect(json[0].props.lineDashPattern).toEqual([8, 6]);

      // Bus segment (index 1)
      expect(json[1].props.strokeColor).toBe("#1E90FF");
      expect(json[1].props.lineDashPattern).toBeUndefined();

      // Metro segment (index 2)
      expect(json[2].props.strokeColor).toBe("#FF6B35");
      expect(json[2].props.lineDashPattern).toBeUndefined();

      // Walking segment (index 3)
      expect(json[3].props.strokeColor).toBe("#40509F");
      expect(json[3].props.lineDashPattern).toEqual([8, 6]);
    });
  });

  describe("default colors for entire route", () => {
    it("uses concordia maroon for shuttle routes with no steps", () => {
      const route = makeRoute({ steps: [] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.SHUTTLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe(COLORS.concordiaMaroon);
      expect(json.props.strokeColor).toBe("#9C2D2D");
    });

    it("uses orange for bicycle routes with no steps", () => {
      const route = makeRoute({ steps: [] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.BICYCLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.strokeColor).toBe("#FF8C00");
    });

    it("uses dashed line for bicycle routes", () => {
      const route = makeRoute({ steps: [] });
      const view = render(
        <RoutePolyline route={route} travelMode={TRAVEL_MODE.BICYCLE} />,
      );
      const json = view.toJSON() as any;
      expect(json.props.lineDashPattern).toEqual([12, 6]);
    });
  });
});
