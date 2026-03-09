const GOOGLE_DIRECTIONS_URL =
  "https://maps.googleapis.com/maps/api/directions/json";

interface LatLng {
  latitude: number;
  longitude: number;
}

export interface DirectionsResult {
  durationMinutes: number;
  distanceMeters: number;
  polyline: string;
}

export type TravelMode = "walking" | "bicycling" | "transit" | "driving";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export async function fetchDirections(
  origin: LatLng,
  destination: LatLng,
  mode: TravelMode,
): Promise<DirectionsResult> {
  const url =
    `${GOOGLE_DIRECTIONS_URL}?origin=${origin.latitude},${origin.longitude}` +
    `&destination=${destination.latitude},${destination.longitude}` +
    `&mode=${mode}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    routes?: {
      legs: { duration: { value: number }; distance: { value: number } }[];
      overview_polyline?: { points: string };
    }[];
  };

  if (!data.routes?.length) {
    throw new Error("No route found");
  }

  const leg = data.routes[0].legs[0];
  return {
    durationMinutes: Math.round(leg.duration.value / 60),
    distanceMeters: leg.distance.value,
    polyline: data.routes[0].overview_polyline?.points ?? "",
  };
}

/** Normalize campus to SGW | LOY for comparison and SHUTTLE_STOPS keys */
export function normalizeCampus(campus: string): "SGW" | "LOY" {
  const u = campus.toUpperCase();
  if (u === "LOYOLA" || u === "LOY") return "LOY";
  return "SGW";
}

export function isCrossCampus(
  originCampus: string,
  destCampus: string,
): boolean {
  return normalizeCampus(originCampus) !== normalizeCampus(destCampus);
}

export async function getAllTravelTimes(
  origin: LatLng,
  destination: LatLng,
): Promise<{
  walk: DirectionsResult;
  bike: DirectionsResult;
  transit: DirectionsResult;
  drive: DirectionsResult;
}> {
  const [walk, bike, transit, drive] = await Promise.all([
    fetchDirections(origin, destination, "walking"),
    fetchDirections(origin, destination, "bicycling"),
    fetchDirections(origin, destination, "transit"),
    fetchDirections(origin, destination, "driving"),
  ]);

  return { walk, bike, transit, drive };
}
