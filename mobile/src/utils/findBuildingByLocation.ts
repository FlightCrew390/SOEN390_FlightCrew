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
 * Matching strategy:
 *  1. Parse structured format → extract campus, building name, room.
 *     Filter to the detected campus and match on name.
 *  2. Exact building code  (case-insensitive, e.g. "H", "MB", "EV")
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

  // ── 1. Structured format: "[Campus] - [Building Name] Rm [Room]" ──
  const structured = parseStructuredLocation(needle);
  if (structured) {
    const candidates = structured.campus
      ? buildings.filter((b) => b.campus === structured.campus)
      : buildings;

    const byStructuredName = matchByName(structured.buildingName, candidates);
    if (byStructuredName) return byStructuredName;

    // If campus-filtered search failed, try all buildings
    if (structured.campus) {
      const fallback = matchByName(structured.buildingName, buildings);
      if (fallback) return fallback;
    }
  }

  // ── 2. Exact building code (e.g. "H", "MB 3.270" → "MB") ──
  const firstToken = needle.split(/[\s,]+/)[0];
  const byCode = buildings.find(
    (b) => b.buildingCode.toLowerCase() === firstToken,
  );
  if (byCode) return byCode;

  // Also try the full needle as a code (single-word locations like "EV")
  if (firstToken !== needle) {
    const byFullCode = buildings.find(
      (b) => b.buildingCode.toLowerCase() === needle,
    );
    if (byFullCode) return byFullCode;
  }

  // ── 3. Name containment ──
  const byName = matchByName(needle, buildings);
  if (byName) return byName;

  // ── 4. Address overlap ──
  const byAddress = buildings.find((b) => {
    const addr = (b.address ?? "").toLowerCase();
    return addr && (needle.includes(addr) || addr.includes(needle));
  });
  if (byAddress) return byAddress;

  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ParsedLocation {
  campus: "SGW" | "LOY" | null;
  buildingName: string;
  room: string | null;
}

/**
 * Try to decompose a structured Concordia location string.
 * Returns null if the string doesn't contain a recognisable separator.
 */
function parseStructuredLocation(input: string): ParsedLocation | null {
  // Detect campus
  let campus: "SGW" | "LOY" | null = null;
  if (input.includes("sir george williams")) campus = "SGW";
  else if (input.includes("loyola")) campus = "LOY";

  // Require a dash separator to treat as structured
  const dashIndex = input.indexOf(" - ");
  if (dashIndex === -1) return null;

  let buildingPart = input.substring(dashIndex + 3).trim();

  // Strip room number: look for "rm" (case-insensitive, already lowered)
  let room: string | null = null;
  const rmIndex = buildingPart.lastIndexOf(" rm ");
  if (rmIndex !== -1) {
    room = buildingPart.substring(rmIndex + 4).trim() || null;
    buildingPart = buildingPart.substring(0, rmIndex).trim();
  }

  if (!buildingPart) return null;

  return { campus, buildingName: buildingPart, room };
}

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

/**
 * Tokenize a string into meaningful words, filtering out stop words
 * and very short tokens (single characters like "j." in initials).
 */
function significantTokens(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,.;:()]+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Match a search string against building long name and short name.
 *
 * Three tiers (first match at the highest tier wins):
 *  1. Exact string equality
 *  2. Full containment in either direction
 *  3. Token overlap — counts significant shared words between the search
 *     and each building name. Requires ≥ 2 shared tokens to avoid false
 *     positives (e.g. a single common word like "Science").
 *
 * Within each tier the candidate with the highest overlap score wins.
 *
 * Example: search = "john molson school of business"
 *   → tokens: ["john", "molson", "school", "business"]
 *   Building_Long_Name = "John Molson Building"
 *   → tokens: ["john", "molson"]
 *   → shared = 2 → matches (and likely the best score on campus).
 */
function matchByName(search: string, candidates: Building[]): Building | null {
  if (!search) return null;

  let best: Building | null = null;
  let bestScore = 0;
  /** Track the "tier" so containment always beats token overlap. */
  let bestTier: 1 | 2 | 3 = 3;

  const searchTokens = significantTokens(search);

  for (const b of candidates) {
    const longName = (b.buildingLongName ?? "").toLowerCase();
    const shortName = (b.buildingName ?? "").toLowerCase();

    for (const name of [longName, shortName]) {
      if (!name) continue;

      // ── Tier 1: exact match ──
      if (name === search) return b;

      // ── Tier 2: full containment ──
      if (search.includes(name) || name.includes(search)) {
        const score = Math.min(name.length, search.length);
        if (bestTier > 2 || (bestTier === 2 && score > bestScore)) {
          bestTier = 2;
          bestScore = score;
          best = b;
        }
        continue;
      }

      // ── Tier 3: token overlap (only if we haven't found a tier-2 match) ──
      if (bestTier <= 2) continue;

      const nameTokens = significantTokens(name);
      const shared = searchTokens.filter((t) => nameTokens.includes(t)).length;

      // Require at least 2 shared significant words to avoid false positives
      if (shared >= 2 && shared > bestScore) {
        bestScore = shared;
        best = b;
      }
    }
  }

  return best;
}
