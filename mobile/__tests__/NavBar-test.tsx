import { expect, test } from "@jest/globals";
import { NavigationContainer } from "@react-navigation/native";
import { act, render, screen, userEvent } from "@testing-library/react-native";

import NavBar from "../src/components/NavBar/NavBar";

jest.useFakeTimers();

test("Initial screen is Home", () => {
  render(
    <NavigationContainer>
      <NavBar />
    </NavigationContainer>,
  );

  expect(screen.getByTestId("home-screen")).toBeTruthy();
  expect(screen.queryByTestId("search-screen")).toBeNull();
  expect(screen.queryByTestId("location-screen")).toBeNull();
  expect(screen.queryByTestId("menu-screen")).toBeNull();
});

test("Screen change on tab press", async () => {
  const user = userEvent.setup();
  render(
    <NavigationContainer>
      <NavBar />
    </NavigationContainer>,
  );

  const button = screen.getByRole("button", { name: "menu" });
  await user.press(button);

  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByTestId("menu-screen")).toBeTruthy();
  expect(screen.queryByTestId("home-screen")).toBeNull();
  expect(screen.queryByTestId("search-screen")).toBeNull();
  expect(screen.queryByTestId("location-screen")).toBeNull();

  await user.press(screen.getByRole("button", { name: "search" }));
  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByTestId("search-screen")).toBeTruthy();
  expect(screen.queryByTestId("home-screen")).toBeNull();
  expect(screen.queryByTestId("location-screen")).toBeNull();
  expect(screen.queryByTestId("menu-screen")).toBeNull();

  await user.press(screen.getByRole("button", { name: "location" }));
  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByTestId("location-screen")).toBeTruthy();
  expect(screen.queryByTestId("home-screen")).toBeNull();
  expect(screen.queryByTestId("search-screen")).toBeNull();
  expect(screen.queryByTestId("menu-screen")).toBeNull();

  await user.press(screen.getByRole("button", { name: "home" }));
  act(() => {
    jest.runAllTimers();
  });

  expect(screen.getByTestId("home-screen")).toBeTruthy();
  expect(screen.queryByTestId("search-screen")).toBeNull();
  expect(screen.queryByTestId("location-screen")).toBeNull();
  expect(screen.queryByTestId("menu-screen")).toBeNull();
});
