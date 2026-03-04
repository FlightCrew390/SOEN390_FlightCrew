import { renderHook } from "@testing-library/react-native";

import { usePanelAnimation } from "../../src/hooks/usePanelAnimation";

beforeEach(() => {
  jest.clearAllMocks();
});

test("returns fadeAnim, slideAnim, and animatedStyle", () => {
  const { result } = renderHook(() => usePanelAnimation(false));

  expect(result.current.fadeAnim).toBeDefined();
  expect(result.current.slideAnim).toBeDefined();
  expect(result.current.animatedStyle).toBeDefined();
});

test("animatedStyle contains opacity and transform", () => {
  const { result } = renderHook(() => usePanelAnimation(false));

  expect(result.current.animatedStyle).toHaveProperty("opacity");
  expect(result.current.animatedStyle).toHaveProperty("transform");
  expect(Array.isArray(result.current.animatedStyle.transform)).toBe(true);
  expect(result.current.animatedStyle.transform[0]).toHaveProperty(
    "translateY",
  );
});

test("does not throw when visible is true", () => {
  expect(() => renderHook(() => usePanelAnimation(true))).not.toThrow();
});

test("does not throw when visible toggles", () => {
  const { rerender } = renderHook(
    ({ visible }: { visible: boolean }) => usePanelAnimation(visible),
    {
      initialProps: { visible: false },
    },
  );

  expect(() => {
    rerender({ visible: true });
  }).not.toThrow();

  expect(() => {
    rerender({ visible: false });
  }).not.toThrow();
});
