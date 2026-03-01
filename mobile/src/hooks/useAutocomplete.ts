import { useMemo } from "react";
import { LocationType } from "../state/SearchPanelState";
import { Building } from "../types/Building";

function fieldMatchesAllWords(field: string, queryWords: string[]): boolean {
  const fieldWords = field.toLowerCase().split(/\W+/);
  return queryWords.every((qw) => fieldWords.some((fw) => fw.startsWith(qw)));
}

function buildingMatchesQuery(b: Building, queryWords: string[]): boolean {
  const gpi = (b as any).Google_Place_Info || {};
  const displayName = gpi.displayName?.text || "";
  const formattedAddress = gpi.formattedAddress || "";
  return (
    fieldMatchesAllWords(b.buildingName, queryWords) ||
    fieldMatchesAllWords(b.buildingLongName, queryWords) ||
    fieldMatchesAllWords(b.buildingCode, queryWords) ||
    fieldMatchesAllWords(displayName, queryWords) ||
    fieldMatchesAllWords(formattedAddress, queryWords) ||
    fieldMatchesAllWords(b.address, queryWords)
  );
}

export function useAutocomplete(
  buildings: Building[],
  query: string,
  locationType: LocationType,
): Building[] {
  return useMemo(() => {
    if (locationType !== "building" || query.trim().length === 0) return [];

    const q = query.trim().toLowerCase();
    const queryWords = q.split(/\W+/).filter((w) => w.length > 0);

    return buildings.filter((b) => buildingMatchesQuery(b, queryWords));
  }, [buildings, query, locationType]);
}
