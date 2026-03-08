import { Building } from "../types/Building";

/**
 * Attempt to resolve a free-text event location to a known campus building.
 *
 * Handles structured strings from Concordia's systems, e.g.:
 *   "Sir George Williams Campus - John Molson School of Business Rm 3.270"
 *   "Loyola Campus - Richard J. Renaud Science Complex Rm SP 365.01"
 *
 * As well as short-hand strings like "H 920", "MB", or a street address.
 *
 * Matching strategy (first match wins):
 *  1. Parse structured format → extract campus, building name, room.
 *  2. Exact building code (case-insensitive, e.g. "H", "MB", "EV")
 *  3. Building long/short name contained in the location or vice-versa
 *  4. Address overlap
 *
 * Returns the best match, or null if nothing reasonable is found.
 */
export function findBuildingByLocation(
  location: string,
  buildings: Building[],
): Building | null {
  if (!location || buildings.length === 0) return null;

  const needle = location.trim().toLowerCase();

  return (
    matchStructured(needle, buildings) ??
    matchByCode(needle, buildings) ??
    matchByName(needle, buildings) ??
    matchByAddress(needle, buildings)
  );
}

// ─── Strategy functions ──────────────────────────────────────────────────────

/** Strategy 1: Parse "[Campus] - [Building Name] Rm [Room]" format. */
function matchStructured(
  needle: string,
  buildings: Building[],
): Building | null {
  const structured = parseStructuredLocation(needle);
  if (!structured) return null;

  const campusFiltered = structured.campus
    ? buildings.filter((b) => b.campus === structured.campus)
    : buildings;

  return (
    matchByName(structured.buildingName, campusFiltered) ??
    matchByName(structured.buildingName, buildings)
  );
}

/** Strategy 2: First token or full string matches a building code. */
function matchByCode(needle: string, buildings: Building[]): Building | null {
  const firstToken = needle.split(/[\s,]+/)[0];

  const findCode = (code: string) =>
    buildings.find((b) => b.buildingCode.toLowerCase() === code) ?? null;

  return (
    findCode(firstToken) ?? (firstToken === needle ? null : findCode(needle))
  );
}

/** Strategy 4: Substring match on address. */
function matchByAddress(
  needle: string,
  buildings: Building[],
): Building | null {
  return (
    buildings.find((b) => {
      const addr = (b.address ?? "").toLowerCase();
      return addr && (needle.includes(addr) || addr.includes(needle));
    }) ?? null
  );
}

// ─── Structured location parser ──────────────────────────────────────────────

interface ParsedLocation {
  campus: "SGW" | "LOY" | null;
  buildingName: string;
  room: string | null;
}

function parseStructuredLocation(input: string): ParsedLocation | null {
  const dashIndex = input.indexOf(" - ");
  if (dashIndex === -1) return null;

  const { buildingName, room } = extractBuildingAndRoom(
    input.substring(dashIndex + 3).trim(),
  );
  if (!buildingName) return null;

  return { campus: detectCampus(input), buildingName, room };
}

function detectCampus(input: string): "SGW" | "LOY" | null {
  if (input.includes("sir george williams")) return "SGW";
  if (input.includes("loyola")) return "LOY";
  return null;
}

function extractBuildingAndRoom(text: string): {
  buildingName: string;
  room: string | null;
} {
  const rmIndex = text.lastIndexOf(" rm ");
  if (rmIndex === -1) return { buildingName: text, room: null };

  return {
    buildingName: text.substring(0, rmIndex).trim(),
    room: text.substring(rmIndex + 4).trim() || null,
  };
}

// ─── Name matching ───────────────────────────────────────────────────────────

/** Words too common / short to be meaningful in a building name match. */
const STOP_WORDS = new Set([
  "the",
  "of",
  "and",
  "for",
  "a",
  "an",
  "at",
  "in",
  "to",
  "de",
  "des",
  "du",
  "building",
  "campus",
  "room",
  "rm",
  "hall",
]);

function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.;:()]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Match a search string against building long/short names.
 *
 * Three tiers (first match at the highest tier wins):
 *  1. Exact string equality (immediate return)
 *  2. Full containment in either direction
 *  3. Token overlap (≥ 2 shared significant words)
 */
function matchByName(search: string, candidates: Building[]): Building | null {
  if (!search) return null;

  const searchTokens = significantTokens(search);
  const scored = candidates.flatMap((b) =>
    scoreBuilding(b, search, searchTokens),
  );

  if (scored.length === 0) return null;

  scored.sort(compareScoredMatches);
  return scored[0].building;
}

interface ScoredMatch {
  building: Building;
  tier: 1 | 2 | 3;
  score: number;
}

function scoreBuilding(
  b: Building,
  search: string,
  searchTokens: string[],
): ScoredMatch[] {
  const names = [b.buildingLongName, b.buildingName]
    .map((n) => (n ?? "").toLowerCase())
    .filter(Boolean);

  return names.flatMap((name) => scoreName(b, name, search, searchTokens));
}

function scoreName(
  building: Building,
  name: string,
  search: string,
  searchTokens: string[],
): ScoredMatch[] {
  if (name === search) {
    return [{ building, tier: 1, score: name.length }];
  }

  if (search.includes(name) || name.includes(search)) {
    return [{ building, tier: 2, score: Math.min(name.length, search.length) }];
  }

  const nameTokens = significantTokens(name);
  const shared = searchTokens.filter((t) => nameTokens.includes(t)).length;

  if (shared >= 2) {
    return [{ building, tier: 3, score: shared }];
  }

  return [];
}

/** Sort: lower tier first, then higher score. */
function compareScoredMatches(a: ScoredMatch, b: ScoredMatch): number {
  return a.tier === b.tier ? b.score - a.score : a.tier - b.tier;
}
