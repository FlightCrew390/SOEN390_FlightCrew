import { useMemo } from "react";
import { LocationType } from "../state/SearchPanelState";
import { Building } from "../types/Building";

export function useAutocomplete(
  buildings: Building[],
  query: string,
  locationType: LocationType,
): Building[] {
  return useMemo(() => {
    if (locationType !== "building" || query.trim().length === 0) return [];

    const q = query.trim().toLowerCase();
    const queryWords = q.split(/\W+/).filter((w) => w.length > 0);

    const isWordMatch = (field: string): boolean => {
      const fieldWords = field.toLowerCase().split(/\W+/);
      return queryWords.every((qw) =>
        fieldWords.some((fw) => fw.startsWith(qw)),
      );
    };

    return buildings.filter((b) => {
      const gpi = (b as any).Google_Place_Info || {};
      const displayName = gpi.displayName?.text || "";
      const formattedAddress = gpi.formattedAddress || "";
      return (
        isWordMatch(b.buildingName) ||
        isWordMatch(b.buildingLongName) ||
        isWordMatch(b.buildingCode) ||
        isWordMatch(displayName) ||
        isWordMatch(formattedAddress) ||
        isWordMatch(b.address)
      );
    });
  }, [buildings, query, locationType]);
}
