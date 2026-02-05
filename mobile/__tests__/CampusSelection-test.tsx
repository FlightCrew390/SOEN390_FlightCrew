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

test("chevron states are correct on first campus", () => {
  render(<CampusSelection />);

  const leftChevron = screen.getByRole("button", { name: "Previous campus" });
  const rightChevron = screen.getByRole("button", { name: "Next campus" });

  expect(leftChevron.props.accessibilityState?.disabled).toBe(true);
  expect(rightChevron.props.accessibilityState?.disabled).toBe(false);
});

test("navigates between campuses and updates button states", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  render(<CampusSelection />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  const leftChevron = screen.getByRole("button", { name: "Previous campus" });

  // Navigate forward to Loyola Campus
  await user.press(rightChevron);
  act(() => jest.runAllTimers());

  expect(screen.getByText("Loyola Campus")).toBeTruthy();
  expect(screen.queryByText("SGW Campus")).toBeNull();
  expect(rightChevron.props.accessibilityState?.disabled).toBe(true);

  // Navigate back to SGW Campus
  await user.press(leftChevron);
  act(() => jest.runAllTimers());

  expect(screen.getByText("SGW Campus")).toBeTruthy();
  expect(screen.queryByText("Loyola Campus")).toBeNull();
});

test("calls onCampusChange callback with correct campus name", async () => {
  const user = userEvent.setup({
    advanceTimers: jest.advanceTimersByTime,
  });
  const mockOnCampusChange = jest.fn();
  render(<CampusSelection onCampusChange={mockOnCampusChange} />);

  const rightChevron = screen.getByRole("button", { name: "Next campus" });
  const leftChevron = screen.getByRole("button", { name: "Previous campus" });

  // Navigate forward
  await user.press(rightChevron);
  act(() => jest.runAllTimers());

  expect(mockOnCampusChange).toHaveBeenCalledWith("LOYOLA");

  // Navigate back
  await user.press(leftChevron);
  act(() => jest.runAllTimers());

  expect(mockOnCampusChange).toHaveBeenCalledTimes(2);
  expect(mockOnCampusChange).toHaveBeenLastCalledWith("SGW");
});
