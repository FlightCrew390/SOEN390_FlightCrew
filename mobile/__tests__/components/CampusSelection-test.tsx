import { render, screen } from "@testing-library/react-native";

import CampusSelection from "../../src/components/LocationScreen/CampusSelection";

jest.mock("@expo/vector-icons/Entypo", () => "");

test("renders correctly showing Loyola campus", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  expect(screen.getByText("Select a Campus")).toBeTruthy();
  expect(screen.getByText("Loyola Campus")).toBeTruthy();
});

test("renders correctly showing SGW campus", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  expect(screen.getByText("SGW Campus")).toBeTruthy();
});

test("chevron states are correct on first campus (LOYOLA)", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  const rightChevron = screen.getByRole("button", { name: "Next campus" });

  expect(leftChevron.props.accessibilityState?.disabled).toBe(true);
  expect(rightChevron.props.accessibilityState?.disabled).toBe(false);
});

test("chevron states are correct on last campus (SGW)", () => {
  const onCampusChange = jest.fn();
  render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  const rightChevron = screen.getByRole("button", { name: "Next campus" });

  expect(leftChevron.props.accessibilityState?.disabled).toBe(false);
  expect(rightChevron.props.accessibilityState?.disabled).toBe(true);
});

test("pressing next chevron calls onCampusChange with next campus", () => {
  const onCampusChange = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fireEvent } = require("@testing-library/react-native");

  render(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  fireEvent.press(rightChevron);

  expect(onCampusChange).toHaveBeenCalledWith("SGW");
});

test("pressing previous chevron calls onCampusChange with previous campus", () => {
  const onCampusChange = jest.fn();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { fireEvent } = require("@testing-library/react-native");

  render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  fireEvent.press(leftChevron);

  expect(onCampusChange).toHaveBeenCalledWith("LOYOLA");
});

test("rerender with different activeCampusId updates displayed campus", () => {
  const onCampusChange = jest.fn();
  const { rerender } = render(
    <CampusSelection activeCampusId="SGW" onCampusChange={onCampusChange} />,
  );

  expect(screen.getByText("SGW Campus")).toBeTruthy();

  rerender(
    <CampusSelection activeCampusId="LOYOLA" onCampusChange={onCampusChange} />,
  );

  expect(screen.getByText("Loyola Campus")).toBeTruthy();
});
