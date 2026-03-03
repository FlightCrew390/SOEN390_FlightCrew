# GitHub Copilot Instructions — SOEN390 FlightCrew

You are assisting with **ConcordiaNav**, a Concordia University campus-navigation app built by Team Flight Crew for SOEN 390 (Winter 2026).

---

## Project architecture

```
SOEN390_FlightCrew/
├── mobile/        — Expo 54 / React Native 0.81.5 (TypeScript strict)
└── backend/       — Spring Boot 4.0.2 / Java 21 / Maven
```

The mobile app communicates exclusively with the Spring Boot backend at `http://<EXPO_PUBLIC_BACKEND_IP>:9090/api`. The backend proxies Google Maps (Routes API, Geocode API) and the Concordia Buildings API.

---

## Mobile: folder map

```
mobile/src/
├── components/
│   ├── LocationScreen/   — screen-specific UI pieces
│   └── NavBar/
├── constants/            — COLORS, API_CONFIG, MAP_CONFIG (UPPER_SNAKE_CASE)
├── contexts/             — React context + provider wrappers
├── hooks/                — custom React hooks (useXxx)
├── models/               — (placeholder — expansion point)
├── reducers/             — pure switch reducers
├── screens/              — top-level screen components
├── services/             — static-method service classes
│   ├── api/              — (placeholder)
│   └── cache/            — (placeholder)
├── state/                — discriminated union action + state types
├── styles/               — StyleSheet files, one per component
├── types/                — shared TypeScript interfaces / types
└── utils/                — pure utility functions
```

Tests live in `mobile/__tests__/` and mirror the `src/` structure exactly.

---

## Mobile: general rules

- **Language**: TypeScript with `strict: true`. Never disable strict checks.
- **Imports**: Import types and values in a single `import` statement — do **not** use `import { type Foo }`.
- **Env vars**: All `EXPO_PUBLIC_*` vars are read through helpers in `src/constants/index.ts` (`API_CONFIG.getBaseUrl()`, etc.) — never hard-code URLs or keys inline.
- **HTTP strings**: Any plain `http://` URL string must end with `// NOSONAR` to suppress SonarCloud security false positives.
- **Icons**: Always import from the specific icon set package — `import FontAwesome5 from "@expo/vector-icons/FontAwesome5"`.
- **Styles**: Each component has a matching `styles/ComponentName.ts` file that exports a `StyleSheet.create({})` default. Import it as `import styles from "../../styles/ComponentName"`.
- **No barrel re-exports** inside `src/` unless one already exists.
- **SonarCloud**: organisation `flightcrew390`. Keep code duplication low; extract shared logic into `utils/` or `hooks/`.

---

## Mobile: context pattern

```typescript
// contexts/XxxContext.tsx
const XxxContext = createContext<ReturnType<typeof useXxxData> | null>(null);

export function XxxProvider({ children }: { children: React.ReactNode }) {
  const value = useXxxData();
  return <XxxContext.Provider value={value}>{children}</XxxContext.Provider>;
}

export function useXxx() {
  const ctx = useContext(XxxContext);
  if (!ctx) throw new Error("useXxx must be used inside XxxProvider");
  return ctx;
}
```

---

## Backend: general rules

- **Java 21**, Jakarta EE 10 (Spring Boot 4.x — no `javax.*` imports, use `jakarta.*`).
- **Dependency injection**: constructor injection only — never `@Autowired` on fields.
- **No service interfaces**: inject concrete `@Service` classes directly.
- **Logging**: `private static final Logger logger = LoggerFactory.getLogger(ClassName.class);`
- **Config values**: `@Value("${property.name}")` injected via constructor.
- **Rate limiting**: the existing `ApiQuotaService` (`60 req/min`) must be called before any outbound Google Maps call.
- **Caching**: use `@Cacheable(value = "cacheName", key = "SpEL")` on service methods that call external APIs.
- **Models**: Lombok `@Data` + Jackson `@JsonProperty("json_key")` for all DTOs.
- **Environment secrets** (`google.api.key`, `external.api.key`, `external.api.user`, `external.api.url`) are loaded via dotenv-java in `main()` and bound through `application.yml` — never hard-code them.
