import { Building } from "../types/Building";

/**
 * Calculate the distance between two coordinates using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // Earth's radius in meters
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

interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Find the building the user is currently in based on their location
 * @param userLocation User's current location
 * @param buildings List of all buildings
 * @param threshold Maximum distance in meters to consider a building as "current" (default: 100m)
 * @returns The building the user is in, or null if none found within threshold
 */
export function findCurrentBuilding(
  userLocation: Location,
  buildings: Building[],
  threshold: number = 100,
): Building | null {
  if (!buildings || buildings.length === 0) {
    return null;
  }

  let nearestBuilding: Building | null = null;
  let nearestDistance = Infinity;

  for (const building of buildings) {
    if (!building.latitude || !building.longitude) {
      continue;
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      building.latitude,
      building.longitude,
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestBuilding = building;
    }
  }

  // Return the nearest building only if it's within the threshold
  return nearestDistance <= threshold ? nearestBuilding : null;
}
