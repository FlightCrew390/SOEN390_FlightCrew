import { expect, jest, test } from "@jest/globals";
import { act, render, screen, userEvent } from "@testing-library/react-native";

import CampusSelection from "../src/components/LocationScreen/CampusSelection";

jest.mock("@expo/vector-icons/Entypo", () => "");

jest.useFakeTimers();

test("renders correctly with initial state", () => {
  render(<CampusSelection />);

  expect(screen.getByText("Select a Campus")).toBeTruthy();
  expect(screen.getByText("SGW Campus")).toBeTruthy();
});

test("left chevron is disabled on first campus", () => {
  render(<CampusSelection />);

  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  expect(leftChevron.props.accessibilityState?.disabled).toBe(true);
});

test("right chevron is enabled on first campus", () => {
  render(<CampusSelection />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  expect(rightChevron.props.accessibilityState?.disabled).toBe(false);
});

test("navigates to next campus when right chevron is pressed", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  render(<CampusSelection />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  await user.press(rightChevron);

  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByText("Loyola Campus")).toBeTruthy();
  expect(screen.queryByText("SGW Campus")).toBeNull();
});

test("navigates back when left chevron is pressed", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  render(<CampusSelection />);

  // Go to second campus
  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  await user.press(rightChevron);

  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByText("Loyola Campus")).toBeTruthy();

  // Go back to first campus
  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  await user.press(leftChevron);

  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByText("SGW Campus")).toBeTruthy();
  expect(screen.queryByText("Loyola Campus")).toBeNull();
});

test("right chevron is disabled on last campus", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  render(<CampusSelection />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  await user.press(rightChevron);

  act(() => {
    jest.runAllTimers();
  });

  expect(rightChevron.props.accessibilityState?.disabled).toBe(true);
});

test("calls onCampusChange callback when campus changes", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  const mockOnCampusChange = jest.fn();
  render(<CampusSelection onCampusChange={mockOnCampusChange} />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  await user.press(rightChevron);

  act(() => {
    jest.runAllTimers();
  });

  expect(mockOnCampusChange).toHaveBeenCalledTimes(1);
  expect(mockOnCampusChange).toHaveBeenCalledWith("Loyola Campus");
});

test("calls onCampusChange with correct campus when navigating back", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  const mockOnCampusChange = jest.fn();
  render(<CampusSelection onCampusChange={mockOnCampusChange} />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  await user.press(rightChevron);

  act(() => {
    jest.runAllTimers();
  });

  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  await user.press(leftChevron);

  act(() => {
    jest.runAllTimers();
  });

  expect(mockOnCampusChange).toHaveBeenCalledTimes(2);
  expect(mockOnCampusChange).toHaveBeenLastCalledWith("SGW Campus");
});
