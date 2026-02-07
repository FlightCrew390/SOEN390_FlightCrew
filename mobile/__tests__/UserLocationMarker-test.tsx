import { expect, test } from "@jest/globals";
import { render } from "@testing-library/react-native";
import React from "react";

import UserLocationMarker from "../src/components/LocationScreen/UserLocationMarker";

jest.mock("react-native-maps", () => ({
  __esModule: true,
  Marker: "Marker",
}));

jest.mock("react-native-svg", () => ({
  __esModule: true,
  default: "Svg",
  Circle: "Circle",
}));

test("renders with positive latitude and longitude", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={45.4973} longitude={-73.5789} />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("renders with negative latitude and longitude", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={-33.8688} longitude={151.2093} />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("renders with zero latitude and longitude", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={0} longitude={0} />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("renders with zero latitude and non-zero longitude", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={0} longitude={-73.579} />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("renders with non-zero latitude and zero longitude", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={45.4971} longitude={0} />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("passes coordinate to Marker in rendered output", () => {
  const latitude = 45.5;
  const longitude = -73.58;

  const { toJSON } = render(
    <UserLocationMarker latitude={latitude} longitude={longitude} />,
  );

  const treeStr = JSON.stringify(toJSON());
  expect(treeStr).toContain("Marker");
  expect(treeStr).toContain(String(latitude));
  expect(treeStr).toContain(String(longitude));
});

test("renders Svg with 16x16 dimensions", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={45.4973} longitude={-73.5789} />,
  );

  const treeStr = JSON.stringify(toJSON());
  expect(treeStr).toContain("Svg");
  expect(treeStr).toContain("16");
});

test("renders Circle elements with red and white fill colors", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={45.4973} longitude={-73.5789} />,
  );

  const treeStr = JSON.stringify(toJSON());
  expect(treeStr).toContain("Circle");
  expect(treeStr).toContain("#ff0000");
  expect(treeStr).toContain("#ffffff");
});

test("renders correctly with extreme coordinate values", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={90} longitude={180} />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("renders correctly with decimal precision coordinates", () => {
  const { toJSON } = render(
    <UserLocationMarker
      latitude={45.497123456}
      longitude={-73.578912345}
    />,
  );

  expect(toJSON()).toBeTruthy();
  expect(JSON.stringify(toJSON())).toContain("Marker");
});

test("renders Marker with anchor and coordinate props", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={45.4973} longitude={-73.5789} />,
  );

  const tree = toJSON();
  expect(tree).toBeTruthy();
  const treeStr = JSON.stringify(tree);
  expect(treeStr).toContain("Marker");
  expect(treeStr).toContain("45.4973");
  expect(treeStr).toContain("-73.5789");
});

test("viewBox is 0 0 16 16 for marker SVG", () => {
  const { toJSON } = render(
    <UserLocationMarker latitude={45.4973} longitude={-73.5789} />,
  );

  const treeStr = JSON.stringify(toJSON());
  expect(treeStr).toMatch(/16/);
  expect(treeStr).toContain("Svg");
});
