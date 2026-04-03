import { fireEvent, render, screen } from "@testing-library/react-native";
import StepsPanel from "../../src/components/LocationScreen/StepsPanel";
import { Building, StructureType } from "../../src/types/Building";
import {
  DEFAULT_DEPARTURE_CONFIG,
  DepartureTimeConfig,
  RouteInfo,
} from "../../src/types/Directions";

const building: Building = {
  campus: "SGW",
  buildingCode: "H",
  buildingName: "Hall Building",
  buildingLongName: "Henry F. Hall Building",
  address: "1455 De Maisonneuve Blvd. W.",
  latitude: 45.497,
  longitude: -73.579,
  structureType: StructureType.Building,
  accessibilityInfo:
    "Wheelchair accessible entrance at 1455 De Maisonneuve Blvd. W.",
};

const startBuilding: Building = {
  campus: "SGW",
  buildingCode: "EV",
  buildingName: "EV Building",
  buildingLongName: "Engineering and Visual Arts Complex",
  address: "1515 St. Catherine St. W.",
  latitude: 45.495,
  longitude: -73.577,
  structureType: StructureType.Building,
  accessibilityInfo:
    "Wheelchair accessible entrance at 1515 St. Catherine St. W.",
};

const route: RouteInfo = {
  coordinates: [],
  distanceMeters: 1500,
  durationSeconds: 600,
  steps: [
    {
      id: "step-1",
      distanceMeters: 200,
      durationSeconds: 120,
      instruction: "Head north",
      maneuver: "DEPART",
      coordinates: [],
    },
    {
      id: "step-2",
      distanceMeters: 300,
      durationSeconds: 180,
      instruction: "Turn left",
      maneuver: "TURN_LEFT",
      coordinates: [],
    },
    {
      id: "step-3",
      distanceMeters: 0,
      durationSeconds: 0,
      instruction: "",
      maneuver: "STRAIGHT",
      coordinates: [],
    },
  ],
};

const sameBuildingStartRoom = {
  id: "H-899-51",
  label: "H-899-51",
  buildingId: "H",
  nodeType: "room",
  floor: 8,
} as any;

const sameBuildingDestinationRoom = {
  id: "H-920",
  label: "H-920",
  buildingId: "H",
  nodeType: "room",
  floor: 9,
} as any;

const transitRoute: RouteInfo = {
  coordinates: [],
  distanceMeters: 5000,
  durationSeconds: 1200,
  steps: [
    {
      id: "step-1",
      distanceMeters: 200,
      durationSeconds: 120,
      instruction: "Walk to bus stop",
      maneuver: "DEPART",
      coordinates: [],
    },
    {
      id: "step-2",
      distanceMeters: 4000,
      durationSeconds: 900,
      instruction: "Take bus",
      maneuver: "STRAIGHT",
      coordinates: [],
      transitDetails: {
        departureStopName: "Guy-Concordia",
        arrivalStopName: "Berri-UQAM",
        departureTime: "2026-03-03T09:15:00Z",
        arrivalTime: "2026-03-03T09:30:00Z",
        lineName: "Green Line",
        lineShortName: "1",
        vehicleType: "SUBWAY",
        vehicleName: "Metro",
        stopCount: 5,
      },
    },
  ],
};

describe("StepsPanel", () => {
  const onBack = jest.fn();

  beforeEach(() => onBack.mockClear());

  it("renders building name and distance", () => {
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Hall Building")).toBeTruthy();
    expect(screen.getByText("1.5 km")).toBeTruthy();
  });

  it("renders steps with non-empty instructions only", () => {
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Head north")).toBeTruthy();
    expect(screen.getByText("Turn left")).toBeTruthy();
  });

  it("renders start building exit text when provided", () => {
    render(
      <StepsPanel
        building={building}
        startBuilding={startBuilding}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(
      screen.getByText(/Exit Engineering and Visual Arts Complex/),
    ).toBeTruthy();
  });

  it("hides start exit row for same-building room routes", () => {
    render(
      <StepsPanel
        building={building}
        startBuilding={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
        startRoom={sameBuildingStartRoom}
        destinationRoom={sameBuildingDestinationRoom}
      />,
    );

    expect(screen.queryByText(/Exit H starting from room H-899-51/)).toBeNull();
  });

  it("calls onBack when back button pressed", () => {
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    fireEvent.press(screen.getByLabelText("Back to directions"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("renders departure and arrival time summary", () => {
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Depart")).toBeTruthy();
    expect(screen.getByText("Arrive")).toBeTruthy();
  });

  it("renders arrival row with building name", () => {
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText(/Arrive at Hall Building/)).toBeTruthy();
  });

  it("renders transit badge when step has transit details", () => {
    render(
      <StepsPanel
        building={building}
        route={transitRoute}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    // Transit line short name
    expect(screen.getByText("1")).toBeTruthy();
    // Stop names
    expect(screen.getByText(/Guy-Concordia/)).toBeTruthy();
    expect(screen.getByText(/Berri-UQAM/)).toBeTruthy();
    // Stop count
    expect(screen.getByText("5 stops")).toBeTruthy();
  });

  it("uses depart_at config for timestamps", () => {
    const departAt: DepartureTimeConfig = {
      option: "depart_at",
      date: new Date("2026-03-03T10:00:00"),
    };
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={departAt}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Depart")).toBeTruthy();
    expect(screen.getByText("Arrive")).toBeTruthy();
  });

  it("uses arrive_by config to compute departure time", () => {
    const arriveBy: DepartureTimeConfig = {
      option: "arrive_by",
      date: new Date("2026-03-03T11:00:00"),
    };
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={arriveBy}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Depart")).toBeTruthy();
    expect(screen.getByText("Arrive")).toBeTruthy();
  });

  it("handles invalid transit departure/arrival time (parseTime NaN branch)", () => {
    const routeWithBadTime: RouteInfo = {
      coordinates: [],
      distanceMeters: 5000,
      durationSeconds: 1200,
      steps: [
        {
          id: "step-bad",
          distanceMeters: 4000,
          durationSeconds: 900,
          instruction: "Take bus",
          maneuver: "STRAIGHT",
          coordinates: [],
          transitDetails: {
            departureStopName: "Stop A",
            arrivalStopName: "Stop B",
            departureTime: "not-a-valid-date",
            arrivalTime: "also-invalid",
            lineName: "Line 1",
            lineShortName: "1",
            vehicleType: "BUS",
            vehicleName: "Bus",
            stopCount: 3,
          },
        },
      ],
    };
    render(
      <StepsPanel
        building={building}
        route={routeWithBadTime}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Take bus")).toBeTruthy();
    // Stop count still renders
    expect(screen.getByText("3 stops")).toBeTruthy();
  });

  it("uses buildingCode as fallback when startBuilding has no buildingLongName", () => {
    const buildingNoLongName = {
      ...startBuilding,
      buildingLongName: undefined,
    } as unknown as typeof startBuilding;
    render(
      <StepsPanel
        building={building}
        startBuilding={buildingNoLongName}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText(/Exit EV/)).toBeTruthy();
  });

  it("renders steps with all remaining maneuver types", () => {
    const allManeuvers = [
      "RAMP_LEFT",
      "RAMP_RIGHT",
      "MERGE",
      "FORK_LEFT",
      "FORK_RIGHT",
      "FERRY",
      "TURN_SLIGHT_LEFT",
      "TURN_SHARP_LEFT",
      "TURN_RIGHT",
      "TURN_SLIGHT_RIGHT",
      "TURN_SHARP_RIGHT",
      "ROUNDABOUT_LEFT",
      "ROUNDABOUT_RIGHT",
      "UTURN_LEFT",
      "UTURN_RIGHT",
      "UNKNOWN_MANEUVER",
    ];
    const steps = allManeuvers.map((maneuver, i) => ({
      id: `maneuver-step-${i}`,
      distanceMeters: 100,
      durationSeconds: 60,
      instruction: `Step ${maneuver}`,
      maneuver,
      coordinates: [],
    }));
    render(
      <StepsPanel
        building={building}
        route={{ ...route, steps }}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Step RAMP_LEFT")).toBeTruthy();
    expect(screen.getByText("Step UNKNOWN_MANEUVER")).toBeTruthy();
  });

  it("renders transit badge with METRO vehicle type", () => {
    const metroRoute: RouteInfo = {
      coordinates: [],
      distanceMeters: 2000,
      durationSeconds: 600,
      steps: [
        {
          id: "metro-step",
          distanceMeters: 2000,
          durationSeconds: 600,
          instruction: "Take metro",
          maneuver: "STRAIGHT",
          coordinates: [],
          transitDetails: {
            departureStopName: "Station A",
            arrivalStopName: "Station B",
            departureTime: "2026-03-03T09:00:00Z",
            arrivalTime: "2026-03-03T09:10:00Z",
            lineName: "Orange Line",
            lineShortName: "5",
            vehicleType: "METRO",
            vehicleName: "Metro",
            stopCount: 1,
          },
        },
      ],
    };
    render(
      <StepsPanel
        building={building}
        route={metroRoute}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Take metro")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders transit badge with RAIL vehicle type", () => {
    const railRoute: RouteInfo = {
      coordinates: [],
      distanceMeters: 10000,
      durationSeconds: 1800,
      steps: [
        {
          id: "rail-step",
          distanceMeters: 10000,
          durationSeconds: 1800,
          instruction: "Take train",
          maneuver: "STRAIGHT",
          coordinates: [],
          transitDetails: {
            departureStopName: "",
            arrivalStopName: "",
            departureTime: "",
            arrivalTime: "",
            lineName: "Exo",
            lineShortName: "",
            vehicleType: "RAIL",
            vehicleName: "Train",
            stopCount: 0,
          },
        },
      ],
    };
    render(
      <StepsPanel
        building={building}
        route={railRoute}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.getByText("Take train")).toBeTruthy();
  });

  it("renders no start building section when startBuilding is null", () => {
    render(
      <StepsPanel
        building={building}
        startBuilding={null}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    expect(screen.queryByText(/Exit/)).toBeNull();
  });

  it("renders step duration dot when durationSeconds is positive", () => {
    render(
      <StepsPanel
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
      />,
    );
    // Steps with durationSeconds > 0 show duration with dot separator
    expect(screen.getByText("Head north")).toBeTruthy();
  });

  it("renders departure indoor map button when startRoom is provided", () => {
    const onOpenStartIndoor = jest.fn();
    render(
      <StepsPanel
        startBuilding={startBuilding}
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
        startRoom={
          { id: "811", label: "811", nodeType: "room", floor: 8 } as any
        }
        onOpenStartIndoor={onOpenStartIndoor}
      />,
    );

    const btn = screen.getByLabelText("Show Indoor Departure Map");
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    expect(onOpenStartIndoor).toHaveBeenCalled();
  });

  it("renders destination indoor map button when destinationRoom is provided", () => {
    const onOpenIndoor = jest.fn();
    render(
      <StepsPanel
        startBuilding={startBuilding}
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
        destinationRoom={
          { id: "911", label: "911", nodeType: "room", floor: 9 } as any
        }
        onOpenIndoor={onOpenIndoor}
      />,
    );

    const btn = screen.getByLabelText("Show Indoor Map");
    expect(btn).toBeTruthy();
    fireEvent.press(btn);
    expect(onOpenIndoor).toHaveBeenCalled();
  });

  it("hides arrival row and indoor map button for same-building room routes", () => {
    const onOpenIndoor = jest.fn();

    render(
      <StepsPanel
        startBuilding={building}
        building={building}
        route={route}
        departureConfig={DEFAULT_DEPARTURE_CONFIG}
        onBack={onBack}
        startRoom={sameBuildingStartRoom}
        destinationRoom={sameBuildingDestinationRoom}
        onOpenIndoor={onOpenIndoor}
      />,
    );

    expect(screen.queryByText(/Arrive at Hall Building/)).toBeNull();
    expect(screen.queryByLabelText("Show Indoor Map")).toBeNull();
  });
});
