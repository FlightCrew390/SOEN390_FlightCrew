---
agent: "ask"
description: "Review code against all ConcordiaNav project conventions and flag any violations."
---

Review the provided code against all ConcordiaNav project conventions. For every issue found, state:

1. **The rule violated** (reference the checklist item)
2. **The exact location** (file, line range)
3. **A concrete fix** (show corrected code)

---

## Mobile (TypeScript / React Native) checklist

### General

- [ ] TypeScript `strict: true` is respected — no `any`, no `@ts-ignore`, no `as unknown as T` without justification.
- [ ] Imports do **not** use `import { type Foo }` — types and values share one `import` statement.
- [ ] No barrel re-exports added unless one already exists in that directory.
- [ ] No hard-coded URLs or API keys — env vars accessed via `API_CONFIG.getBaseUrl()` or `EXPO_PUBLIC_*` constants.
- [ ] Every `http://` URL string ends with `// NOSONAR`.

### Components

- [ ] Props interface is named `<ComponentName>Props` and wrapped in `Readonly<...>`.
- [ ] Component is a `export default function` (not an arrow function at module level).
- [ ] Every interactive element has `accessibilityLabel` **and** `accessibilityRole`.
- [ ] Root `<View>` has a `testID` in `kebab-case` matching the component name.
- [ ] Styles are imported from `../../styles/ComponentName` — no inline `style={{ ... }}` objects.
- [ ] All colours use `COLORS` from `../../constants` — no raw hex/RGB strings.
- [ ] Icons are imported as `import FontAwesome5 from "@expo/vector-icons/FontAwesome5"`.
- [ ] No logic or data fetching inside the component — delegate to hooks.

### Hooks

- [ ] Hook is a named export (`export function useXxx` or `export const useXxx =`).
- [ ] Complex state uses a typed interface; simple state uses `useState`.
- [ ] Every `useEffect` that sets state has an `isMounted` guard or `AbortController` cleanup.
- [ ] Callbacks returned by the hook or passed as props are wrapped in `useCallback`.
- [ ] Hook returns a **plain object** with named fields — not an array.
- [ ] No direct `fetch` calls inside hooks — service classes are used instead.

### Services

- [ ] Class has only `static` methods — no constructor, no instance state.
- [ ] Base URL comes from `API_CONFIG.getBaseUrl()` — not hard-coded.
- [ ] HTTP status codes handled explicitly: `204` → null, `429` → quota error, `!ok` → generic error.
- [ ] `console.error(error)` called before rethrowing in catch blocks.
- [ ] Parsing logic lives in **private helper functions outside the class**, not as static methods.

### Reducers

- [ ] State and action types live in `state/XxxState.ts` — not in the reducer file.
- [ ] Reducer is a pure function — no side effects, no API calls.
- [ ] Every `case` returns `{ ...state, changes }` — no mutation.
- [ ] `default` branch returns `state` unchanged.
- [ ] `initialXxxState` is exported from the **state file**, not the reducer.

### Contexts

- [ ] Follows the `createContext<ReturnType<typeof useXxxData> | null>(null)` pattern.
- [ ] `useXxx()` guard throws `"useXxx must be used inside XxxProvider"`.

### Tests

- [ ] Test file is named `<Name>-test.ts(x)` — not `.spec.` or `-spec.`.
- [ ] Test data built with `makeBuilding()` / `makeRoute()` / `makeStep()` fixtures (not inline objects).
- [ ] Component tests use a `render<ComponentName>` helper function.
- [ ] Contexts, icons (`@expo/vector-icons/FontAwesome5`), and styles are properly mocked.
- [ ] Assertions use `getByTestId`, `getByLabelText`, or `getByText` — not `getByRole` with numeric indexes.
- [ ] No snapshot tests of large component trees.
- [ ] Branch coverage ≥ 80% (happy path + error/edge cases covered).

---

## Backend (Java / Spring Boot) checklist

- [ ] All imports use `jakarta.*` — no `javax.*`.
- [ ] Dependency injection is **constructor-only** — no `@Autowired` on fields.
- [ ] No service interfaces — concrete `@Service` classes injected directly.
- [ ] Logger declared as `private static final Logger logger = LoggerFactory.getLogger(ClassName.class);`
- [ ] Config values use `@Value("${property.name}")` — no hard-coded strings.
- [ ] `apiQuotaService.checkQuota()` called before any outbound Google Maps API request.
- [ ] Service methods calling external APIs are annotated with `@Cacheable`.
- [ ] DTOs use Lombok `@Data` + `@JsonProperty("snake_case")` for all fields.
- [ ] Controllers return `ResponseEntity<T>` — not raw objects.
- [ ] No environment secrets hard-coded — all come from `application.yml` / dotenv.
- [ ] JUnit 5 + Mockito tests cover ≥ 80% of lines and branches.

---

## After review

Summarise findings as:

- **Critical** — violates a hard project rule (e.g., hard-coded secret, missing `// NOSONAR`, field `@Autowired`)
- **Major** — breaks a strong convention (e.g., missing `testID`, no `isMounted` cleanup)
- **Minor** — style or DX improvement (e.g., missing JSDoc on a complex hook param)

Provide the total count of issues per severity.
