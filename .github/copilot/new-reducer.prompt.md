---
agent: "agent"
description: "Create a new Redux-style reducer with typed state and actions for ConcordiaNav."
---

Create a new reducer with its state and action types for the ConcordiaNav app. Follow every rule below exactly.

## File locations

- State + action types: `mobile/src/state/<Feature>State.ts`
- Reducer: `mobile/src/reducers/<feature>Reducer.ts`
- Test: `mobile/__tests__/reducers/<feature>Reducer-test.ts`

## State file (`mobile/src/state/<Feature>State.ts`)

```typescript
// 1. State interface
export interface MyFeatureState {
  readonly someField: string | null;
  readonly loading: boolean;
  readonly panel: "none" | "search" | "directions";
}

// 2. Initial state — exported constant
export const initialMyFeatureState: MyFeatureState = {
  someField: null,
  loading: false,
  panel: "none",
};

// 3. Discriminated union action type
export type MyFeatureAction =
  | { type: "SET_FIELD"; value: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "OPEN_PANEL"; panel: "search" | "directions" }
  | { type: "RESET" };
```

## Reducer file (`mobile/src/reducers/<feature>Reducer.ts`)

```typescript
import {
  MyFeatureAction,
  MyFeatureState,
  initialMyFeatureState,
} from "../state/MyFeatureState";

export function myFeatureReducer(
  state: MyFeatureState = initialMyFeatureState,
  action: MyFeatureAction,
): MyFeatureState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, someField: action.value };
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "OPEN_PANEL":
      return { ...state, panel: action.panel };
    case "RESET":
      return initialMyFeatureState;
    default:
      return state;
  }
}
```

### Rules to enforce

- State and action types live **only** in `state/`, never inside the reducer file.
- The reducer is a **pure function** — no side effects, no API calls, no `console.log`.
- Always spread state: `return { ...state, changed }` — never mutate.
- Export `initialXxxState` from the state file — not from the reducer.
- The `default` branch must return `state` unchanged.
- The reducer function must be the **named export** from the reducer file (not default export).

## Import rules

- Import types and values in the same `import` statement — never `import { type Foo }`.

## After generating

1. Show how to wire this reducer into a hook with `useReducer(myFeatureReducer, initialMyFeatureState)`.
2. List all action types and confirm the state shape covers the intended feature.
