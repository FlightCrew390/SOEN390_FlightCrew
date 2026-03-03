---
agent: "agent"
description: "Create a new custom React hook for ConcordiaNav following all project conventions."
---

Create a new custom React hook for the ConcordiaNav app. Follow every rule below exactly.

## File locations

- Hook: `mobile/src/hooks/use<Name>.ts`
- Test: `mobile/__tests__/hooks/use<Name>-test.ts`

## Hook rules

```typescript
// 1. Named export — NOT default export
export function useMyFeature(params: MyFeatureParams) {
  // ...
}

// -- OR for simple hooks without params:
export const useMyFeature = () => {
  // ...
};
```

### State

- If the hook manages multiple related state fields, define a typed state interface:

```typescript
interface MyFeatureState {
  data: DataType | null;
  loading: boolean;
  error: string | null;
}

const initialState: MyFeatureState = {
  data: null,
  loading: false,
  error: null,
};
```

- For complex state transitions, use `useReducer`. The reducer and its types must live in `src/reducers/` and `src/state/` respectively (see the `new-reducer` prompt).
- For simple independent fields, `useState` is fine.

### Effects

- Every `useEffect` that sets state **must** guard against setting state after unmount:

```typescript
useEffect(() => {
  let isMounted = true;
  async function load() {
    try {
      const result = await SomeService.fetch();
      if (isMounted) setState(result);
    } catch (e) {
      if (isMounted) setError(String(e));
    }
  }
  load();
  return () => {
    isMounted = false;
  };
}, [dependency]);
```

- For network calls that need cancellation, prefer `AbortController` and pass the signal to `fetch`.

### Callbacks

- Wrap every callback that is passed as a prop or returned from the hook in `useCallback` to maintain a stable reference.

### Return value

- Always return a **plain object** (not an array) with named fields:

```typescript
return { data, loading, error, refresh };
```

### Services

- Call service classes (e.g., `DirectionsService.fetchDirections(...)`) — do **not** call `fetch` directly inside hooks.

## Import rules

- Import types and values in the same `import` statement — never `import { type Foo }`.

## After generating

1. Remind me to add the hook to the appropriate `<Xxx>Provider` or call it from the correct screen.
2. List side effects this hook introduces (network calls, location subscriptions, timers) and confirm cleanup is handled.
