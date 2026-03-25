import INDOOR_POIS from "../data/indoorPOIs";
import { IndoorPointOfInterest } from "../types/IndoorPointOfInterest";

/**
 * Returns all indoor points of interest for a given building code.
 * Building codes must be uppercase (e.g. "H", "MB", "EV").
 * Returns an empty array if the code is empty or has no registered POIs.
 */
export function getIndoorPoisForBuilding(
  buildingCode: string,
): IndoorPointOfInterest[] {
  const code = buildingCode.trim().toUpperCase();
  if (!code) return [];
  return INDOOR_POIS[code] ?? [];
}
