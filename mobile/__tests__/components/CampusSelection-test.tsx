import { render, screen } from "@testing-library/react-native";

import CampusSelection from "../../src/components/LocationScreen/CampusSelection";

test("renders correctly showing Loyola campus", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  expect(screen.getByText("Select a Campus")).toBeTruthy();
  expect(screen.getByText("SGW")).toBeTruthy();
  expect(screen.getByText("Loyola")).toBeTruthy();
});

test("renders correctly showing SGW campus", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  expect(screen.getByText("SGW")).toBeTruthy();
  expect(screen.getByText("Loyola")).toBeTruthy();
});

test("active campus is marked as selected", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  const sgwOption = screen.getByRole("button", { name: "SGW Campus selector" });
  const loyolaOption = screen.getByRole("button", {
    name: "Loyola Campus selector",
  });

  expect(sgwOption.props.accessibilityState?.selected).toBe(false);
  expect(loyolaOption.props.accessibilityState?.selected).toBe(true);
});

test("changing the active campus updates the selected state", () => {
  const onCampusChange = jest.fn();
  const { rerender } = render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  let sgwOption = screen.getByRole("button", { name: "SGW Campus selector" });
  let loyolaOption = screen.getByRole("button", {
    name: "Loyola Campus selector",
  });

  expect(sgwOption.props.accessibilityState?.selected).toBe(true);
  expect(loyolaOption.props.accessibilityState?.selected).toBe(false);

  rerender(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  sgwOption = screen.getByRole("button", { name: "SGW Campus selector" });
  loyolaOption = screen.getByRole("button", {
    name: "Loyola Campus selector",
  });

  expect(sgwOption.props.accessibilityState?.selected).toBe(false);
  expect(loyolaOption.props.accessibilityState?.selected).toBe(true);
});

test("pressing SGW calls onCampusChange with SGW", () => {
  const onCampusChange = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fireEvent } = require("@testing-library/react-native");

  render(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  const sgwOption = screen.getByRole("button", { name: "SGW Campus selector" });
  fireEvent.press(sgwOption);

  expect(onCampusChange).toHaveBeenCalledWith("SGW");
});

test("pressing Loyola calls onCampusChange with LOYOLA", () => {
  const onCampusChange = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fireEvent } = require("@testing-library/react-native");

  render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  const loyolaOption = screen.getByRole("button", {
    name: "Loyola Campus selector",
  });
  fireEvent.press(loyolaOption);

  expect(onCampusChange).toHaveBeenCalledWith("LOYOLA");
});

test("rerender with different activeCampusId updates selected campus", () => {
  const onCampusChange = jest.fn();
  const { rerender } = render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  expect(
    screen.getByRole("button", { name: "SGW Campus selector" }).props
      .accessibilityState?.selected,
  ).toBe(true);

  rerender(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  expect(
    screen.getByRole("button", { name: "Loyola Campus selector" }).props
      .accessibilityState?.selected,
  ).toBe(true);
});
