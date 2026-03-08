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
});
