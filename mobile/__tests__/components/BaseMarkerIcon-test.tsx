import { render, screen } from "@testing-library/react-native";
import React from "react";
import { View } from "react-native";
import BaseMarkerIcon from "../../src/components/LocationScreen/BaseMarkerIcon";

jest.mock("react-native-svg", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: ({ children, width, height }: any) => (
      <View testID="svg-root" accessibilityLabel={`${width}x${height}`}>
        {children}
      </View>
    ),
    Circle: ({ testID, fill, stroke }: any) => (
      <View testID={testID ?? `circle-${fill ?? stroke}`} />
    ),
  };
});

describe("BaseMarkerIcon", () => {
  it("renders the SVG root", () => {
    render(<BaseMarkerIcon color="#ff0000" />);
    expect(screen.getByTestId("svg-root")).toBeTruthy();
  });

  it("defaults to scale 1 (40x40)", () => {
    render(<BaseMarkerIcon color="#ff0000" />);
    expect(screen.getByTestId("svg-root").props.accessibilityLabel).toBe(
      "40x40",
    );
  });

  it("scales dimensions by the scale prop", () => {
    render(<BaseMarkerIcon color="#ff0000" scale={1.3} />);
    expect(screen.getByTestId("svg-root").props.accessibilityLabel).toBe(
      "52x52",
    );
  });

  it("renders children inside the SVG", () => {
    render(
      <BaseMarkerIcon color="#ff0000">
        <View testID="child-icon" />
      </BaseMarkerIcon>,
    );
    expect(screen.getByTestId("child-icon")).toBeTruthy();
  });

  it("marker frame has constant dimensions regardless of scale", () => {
    const { rerender } = render(<BaseMarkerIcon color="#ff0000" scale={1} />);
    const frameAtScale1 = screen.getByTestId("marker-frame").props.style;

    rerender(<BaseMarkerIcon color="#ff0000" scale={1.3} />);
    const frameAtScale13 = screen.getByTestId("marker-frame").props.style;

    expect(frameAtScale1.width).toBe(frameAtScale13.width);
    expect(frameAtScale1.height).toBe(frameAtScale13.height);
  });

  it("marker frame is sized at the maximum scale", () => {
    render(<BaseMarkerIcon color="#ff0000" scale={1} />);
    const frame = screen.getByTestId("marker-frame").props.style;
    // Frame is always 52x52 (40 * MAX_SCALE 1.3) so Android never clips on selection
    expect(frame.width).toBe(52);
    expect(frame.height).toBe(52);
  });
});
