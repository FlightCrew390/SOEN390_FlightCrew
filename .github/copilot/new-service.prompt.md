---
agent: "agent"
description: "Create a new mobile service class for ConcordiaNav following all project conventions."
---

Create a new mobile service class for the ConcordiaNav app. Follow every rule below exactly.

## File locations

- Service: `mobile/src/services/<ServiceName>Service.ts`
- Test: `mobile/__tests__/services/<ServiceName>Service-test.ts`

## Service class rules

```typescript
import { API_CONFIG } from "../constants";

export class MyFeatureService {
  static async fetchSomething(param: string): Promise<ResultType | null> {
    const url = `${API_CONFIG.getBaseUrl()}/endpoint`; // NOSONAR
    const response = await fetch(url);

    if (response.status === 204) return null;
    if (response.status === 429) throw new Error("API quota exceeded");
    if (!response.ok)
      throw new Error(`Unexpected response: ${response.status}`);

    const data = (await response.json()) as RawApiType;
    return parseResult(data);
  }
}

// Private helpers outside the class — NOT methods
function parseResult(raw: RawApiType): ResultType {
  // ...
}
```

### Rules to enforce

- `export class` with **only `static` methods** — no constructor, no instance state.
- Base URL **must** come from `API_CONFIG.getBaseUrl()` — never hard-code a URL.
- Any `http://` URL string must end with `// NOSONAR`.
- Handle HTTP status codes explicitly before calling `.json()`:
  - `204` → return `null`
  - `429` → throw with message `"API quota exceeded"`
  - `!response.ok` → throw with status code in message
- Call `console.error(error)` before rethrowing in catch blocks.
- Parsing / transformation logic goes in **private helper functions outside the class**, not as static methods.
- Return types must be accurately typed — no `any`.

## Import rules

- Import types and values in the same `import` statement — never `import { type Foo }`.

## After generating

1. Remind me to mock this service with `jest.mock(...)` in any hooks or components that depend on it.
2. Confirm that the endpoint path matches a route defined in the Spring Boot backend.
