import { render, screen } from "@testing-library/react-native";
import TransitBadge from "../../src/components/LocationScreen/TransitBadge";
import { TransitStepDetails } from "../../src/types/Directions";

jest.mock("@expo/vector-icons/MaterialIcons", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text } = require("react-native");
  const MockIcon = (props: Record<string, unknown>) => (
    <Text testID="material-icon" {...props} />
  );
  MockIcon.displayName = "MaterialIcons";
  return MockIcon;
});

jest.mock("../../src/styles/StepsPanel", () => ({
  __esModule: true,
  default: {
    transitBadge: {},
    transitLineRow: {},
    transitLineName: {},
    transitStop: {},
    transitStopCount: {},
  },
}));

const baseShuttle: TransitStepDetails = {
  departureStopName: "SGW (Hall Building)",
  arrivalStopName: "Loyola Campus",
  departureTime: "2026-03-03T10:00:00Z",
  arrivalTime: "2026-03-03T10:21:00Z",
  lineName: "Concordia Shuttle",
  lineShortName: "Shuttle",
  vehicleType: "BUS",
  vehicleName: "Concordia Shuttle",
  stopCount: 1,
};

describe("TransitBadge", () => {
  it("renders compact campus shuttle line", () => {
    render(<TransitBadge transit={baseShuttle} />);
    expect(screen.getByText("Campus shuttle")).toBeTruthy();
    expect(screen.getByText("SGW → Loyola")).toBeTruthy();
  });

  it("shows Between campuses when shuttle stops are missing", () => {
    render(
      <TransitBadge
        transit={{
          ...baseShuttle,
          departureStopName: "",
          arrivalStopName: "",
        }}
      />,
    );
    expect(screen.getByText("Between campuses")).toBeTruthy();
  });

  it("shows single campus label when only one stop is present", () => {
    render(
      <TransitBadge
        transit={{
          ...baseShuttle,
          arrivalStopName: "",
        }}
      />,
    );
    expect(screen.getByText("SGW")).toBeTruthy();
  });

  it("renders full metro-style badge for non-shuttle transit", () => {
    const metro: TransitStepDetails = {
      departureStopName: "Guy-Concordia",
      arrivalStopName: "Berri-UQAM",
      departureTime: "2026-03-03T09:15:00Z",
      arrivalTime: "2026-03-03T09:30:00Z",
      lineName: "Green Line",
      lineShortName: "1",
      vehicleType: "SUBWAY",
      vehicleName: "Metro",
      stopCount: 3,
    };
    render(<TransitBadge transit={metro} />);
    expect(screen.getByText("1")).toBeTruthy();
    expect(screen.getByText(/Guy-Concordia/)).toBeTruthy();
    expect(screen.getByText(/Berri-UQAM/)).toBeTruthy();
    expect(screen.getByText("3 stops")).toBeTruthy();
  });
});
