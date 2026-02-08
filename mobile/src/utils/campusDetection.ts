import { CampusId, CAMPUSES } from "../constants/campuses";
import { calculateDistance } from "./buildingDetection";

/**
 * Returns which campus (SGW or LOYOLA) the given coordinates are closest to.
 */
export function getClosestCampusId(
  latitude: number,
  longitude: number,
): CampusId {
  const campusIds: CampusId[] = ["LOYOLA", "SGW"];
  let closest: CampusId = "SGW";
  let minDist = Infinity;

  for (const id of campusIds) {
    const campus = CAMPUSES[id];
    const d = calculateDistance(
      latitude,
      longitude,
      campus.location.latitude,
      campus.location.longitude,
    );
    if (d < minDist) {
      minDist = d;
      closest = id;
    }
  }

  return closest;
}
