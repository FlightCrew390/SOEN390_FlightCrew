import { CampusId, CAMPUSES } from "../constants/campuses";

function distanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
    const d = distanceMeters(
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
