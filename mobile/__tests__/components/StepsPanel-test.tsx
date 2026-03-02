import { fireEvent, render, screen } from "@testing-library/react-native";
import StepsPanel from "../../src/components/LocationScreen/StepsPanel";
import { Building, StructureType } from "../../src/types/Building";
import { RouteInfo } from "../../src/types/Directions";

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

describe("StepsPanel", () => {
  const onBack = jest.fn();

  beforeEach(() => onBack.mockClear());

  it("renders building name and distance", () => {
    render(<StepsPanel building={building} route={route} onBack={onBack} />);
    expect(screen.getByText("Hall Building")).toBeTruthy();
    expect(screen.getByText("1.5 km")).toBeTruthy();
  });

  it("renders steps with non-empty instructions only", () => {
    render(<StepsPanel building={building} route={route} onBack={onBack} />);
    expect(screen.getByText("Head north")).toBeTruthy();
    expect(screen.getByText("Turn left")).toBeTruthy();
    expect(screen.queryByText("")).toBeFalsy();
  });

  it("renders start building exit text when provided", () => {
    render(
      <StepsPanel
        building={building}
        startBuilding={startBuilding}
        route={route}
        onBack={onBack}
      />,
    );
    expect(
      screen.getByText(/Exit Engineering and Visual Arts Complex/),
    ).toBeTruthy();
  });

  it("calls onBack when back button pressed", () => {
    render(<StepsPanel building={building} route={route} onBack={onBack} />);
    fireEvent.press(screen.getByLabelText("Back to directions"));
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
