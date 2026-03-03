---
agent: "agent"
description: "Write Jest tests for a ConcordiaNav mobile file following all project testing conventions."
---

Write Jest tests for the specified file in the ConcordiaNav mobile app. Follow every rule below exactly.

## File naming

Test files are named `<OriginalName>-test.ts(x)` — never `.spec.`. They live in `mobile/__tests__/` mirroring the `src/` folder structure:

| Source                                  | Test                                    |
| --------------------------------------- | --------------------------------------- |
| `src/components/LocationScreen/Foo.tsx` | `__tests__/components/Foo-test.tsx`     |
| `src/hooks/useFoo.ts`                   | `__tests__/hooks/useFoo-test.ts`        |
| `src/services/FooService.ts`            | `__tests__/services/FooService-test.ts` |
| `src/reducers/fooReducer.ts`            | `__tests__/reducers/fooReducer-test.ts` |
| `src/utils/foo.ts`                      | `__tests__/utils/foo-test.ts`           |

## Fixtures

- Always use builder functions from `mobile/__tests__/fixtures.ts` (e.g. `makeBuilding()`, `makeRoute()`, `makeStep()`) to construct test data.
- Pass `Partial<T>` overrides instead of constructing objects inline.

## Component tests

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";

// 1. Render helper — avoids repeating props in every test
function renderMyComponent(overrides: Partial<MyComponentProps> = {}) {
  const props: MyComponentProps = {
    visible: true,
    onClose: jest.fn(),
    // defaults...
    ...overrides,
  };
  return { ...render(<MyComponent {...props} />), props };
}

// 2. Mock contexts
jest.mock("../../src/contexts/BuildingContext", () => ({
  useBuildings: () => mockUseBuildings(),
}));

// 3. Mock icons (lightweight replacement)
jest.mock("@expo/vector-icons/FontAwesome5", () => {
  const { Text } = require("react-native");
  return ({ name }: { name: string }) => <Text>{name}</Text>;
});

// 4. Mock styles (flat empty objects — avoids StyleSheet.create issues)
jest.mock("../../src/styles/MyComponent", () => ({
  default: { container: {}, button: {} },
}));

// 5. Assertions — prefer semantics over implementation
expect(screen.getByText("Expected text")).toBeTruthy();
expect(screen.getByLabelText("Accessibility label")).toBeTruthy();
expect(screen.getByTestId("component-testid")).toBeTruthy();
fireEvent.press(screen.getByLabelText("Button label"));
```

## Hook tests

```typescript
import { renderHook, waitFor } from "@testing-library/react-native";

jest.mock("../../src/services/MyService");
const mockMethod = MyService.method as jest.MockedFunction<
  typeof MyService.method
>;

it("description", async () => {
  mockMethod.mockResolvedValueOnce(mockData);
  const { result } = renderHook(() => useMyHook({ param }));
  await waitFor(() => expect(result.current.data).toEqual(mockData));
});
```

## Reducer tests

```typescript
import { myFeatureReducer } from "../../src/reducers/myFeatureReducer";
import { initialMyFeatureState } from "../../src/state/MyFeatureState";

it("ACTION_TYPE does the right thing", () => {
  const prev = { ...initialMyFeatureState, someField: "old" };
  const next = myFeatureReducer(prev, { type: "ACTION_TYPE", value: "new" });
  expect(next.someField).toBe("new");
  // confirm other fields unchanged
  expect(next.loading).toBe(prev.loading);
});
```

## Service tests

```typescript
const mockFetch = jest.fn();
globalThis.fetch = mockFetch;

function createApiResponse(overrides = {}) {
  return { routes: [{ distanceMeters: 1500, ...overrides }] };
}

beforeEach(() => mockFetch.mockReset());

it("returns parsed result on 200", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => createApiResponse(),
  });
  const result = await MyService.fetch("arg");
  expect(result).not.toBeNull();
});

it("returns null on 204", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    status: 204,
    json: async () => ({}),
  });
  expect(await MyService.fetch("arg")).toBeNull();
});

it("throws on 429", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 429,
    json: async () => ({}),
  });
  await expect(MyService.fetch("arg")).rejects.toThrow("quota");
});
```

## General rules

- Every test must have a clear description string: start with the action, then expected result (`"renders close button"`, `"throws on 429"`).
- Do **not** test implementation details (internal state, private helpers). Test public behaviour.
- Aim for **≥ 80% branch coverage** — test the main happy path plus every error/edge branch.
- Do **not** snapshot-test large component trees; prefer targeted `getBy*` assertions.

## After generating

1. Run `npx jest --coverage <TestFilePath>` and include a summary of coverage results.
2. Flag any branches that remain uncovered and suggest additional test cases.
