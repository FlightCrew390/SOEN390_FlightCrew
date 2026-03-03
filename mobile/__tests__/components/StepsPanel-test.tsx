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
};

const route: RouteInfo = {
  coordinates: [],
  distanceMeters: 1500,
  durationSeconds: 600,
  steps: [
    {
      distanceMeters: 200,
      durationSeconds: 120,
      instruction: "Head north",
      maneuver: "DEPART",
      coordinates: [],
    },
    {
      distanceMeters: 300,
      durationSeconds: 180,
      instruction: "Turn left",
      maneuver: "TURN_LEFT",
      coordinates: [],
    },
    {
      distanceMeters: 0,
      durationSeconds: 0,
      instruction: "",
      maneuver: "STRAIGHT",
      coordinates: [],
    },
  ],
};

const transitRoute: RouteInfo = {
  coordinates: [],
  distanceMeters: 5000,
  durationSeconds: 1200,
  steps: [
    {
      distanceMeters: 200,
      durationSeconds: 120,
      instruction: "Walk to bus stop",
      maneuver: "DEPART",
      coordinates: [],
    },
    {
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
});
