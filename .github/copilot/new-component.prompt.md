---
agent: "agent"
description: "Create a new React Native component for ConcordiaNav following all project conventions."
---

Create a new React Native component for the ConcordiaNav app. Follow every rule below exactly.

## File locations

- Component: `mobile/src/components/<Folder>/<ComponentName>.tsx`
  - Use `LocationScreen/` for screen-specific UI pieces, `NavBar/` for nav items, or create a new folder as appropriate.
- Styles: `mobile/src/styles/<ComponentName>.ts` — **always** create this companion file.
- Test: `mobile/__tests__/components/<ComponentName>-test.tsx` — create alongside the component.

## Component rules

```typescript
// 1. Props interface — always Readonly, props named <ComponentName>Props
interface ComponentNameProps {
  readonly someProp: string;
  readonly onAction: () => void;
}

// 2. Default export function — NOT arrow function at module level
export default function ComponentName({
  someProp,
  onAction,
}: Readonly<ComponentNameProps>) {
  // ...
}
```

- Every interactive element must have `accessibilityLabel` and `accessibilityRole`.
- Every root `<View>` must have a `testID` following the pattern `"component-name"` (kebab-case).
- Import styles from the companion file: `import styles from "../../styles/ComponentName"`.
- Import icons **only** as: `import FontAwesome5 from "@expo/vector-icons/FontAwesome5"`.
- Do **not** inline styles; every style must be defined in the companion `styles/` file.
- Use `COLORS` from `../../constants` for all colour values.
- Do **not** hard-code any URL or API key — use `API_CONFIG.getBaseUrl()` if a URL is needed.

## Styles file rules (`mobile/src/styles/<ComponentName>.ts`)

```typescript
import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

export default StyleSheet.create({
  container: {
    // ...
  },
});
```

## Import rules

- Import types and values in the same `import` statement — never `import { type Foo }`.
- No barrel re-exports unless one already exists in that directory.

## After generating

1. Remind me to run `npm run lint` inside `mobile/` to verify there are no ESLint errors.
2. List any props that may need to be added/changed based on where this component will be used.
