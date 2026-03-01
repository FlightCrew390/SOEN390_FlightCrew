import { fireEvent, render, screen } from "@testing-library/react-native";
import TransportCard from "../../src/components/LocationScreen/TransportCard";

// Mock styles
jest.mock("../../src/styles/DirectionPanel", () => ({
  __esModule: true,
  default: {
    transportCard: { padding: 8 },
    transportCardActive: { backgroundColor: "#eee" },
    transportIcon: { width: 24, height: 24 },
    transportIconActive: { tintColor: "blue" },
    transportTime: { color: "#666" },
    transportTimeActive: { color: "#000" },
  },
}));

const mockIcon = 1; // require() returns a number in RN

describe("TransportCard", () => {
  const defaultProps = {
    icon: mockIcon,
    label: "Walk",
    duration: "5 min",
    isActive: false,
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the duration text", () => {
    render(<TransportCard {...defaultProps} />);
    expect(screen.getByText("5 min")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    render(<TransportCard {...defaultProps} onPress={onPress} />);
    fireEvent.press(screen.getByRole("button"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("sets accessibility label with the transport label", () => {
    render(<TransportCard {...defaultProps} label="Bike" />);
    expect(screen.getByLabelText("Get directions by Bike")).toBeTruthy();
  });

  it("renders the image source", () => {
    const { UNSAFE_getByType } = render(<TransportCard {...defaultProps} />);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Image } = require("react-native");
    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toBe(mockIcon);
  });

  it("applies active styles when isActive is true", () => {
    render(<TransportCard {...defaultProps} isActive={true} />);
    const button = screen.getByRole("button");
    // The Pressable should have the active style applied
    // (flattenStyle includes transportCardActive)
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#eee" }),
      ]),
    );
  });

  it("does not apply active styles when isActive is false", () => {
    render(<TransportCard {...defaultProps} isActive={false} />);
    const button = screen.getByRole("button");
    expect(button.props.style).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: "#eee" }),
      ]),
    );
  });

  it("displays different duration values", () => {
    render(<TransportCard {...defaultProps} duration="-- min" />);
    expect(screen.getByText("-- min")).toBeTruthy();
  });
});
