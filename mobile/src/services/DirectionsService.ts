import { API_CONFIG } from "../constants";

export type TravelMode = "walking" | "bicycling" | "transit" | "driving";

export interface DirectionStep {
  instruction: string;
}

export interface DirectionsResult {
  encodedPolyline: string;
  steps: DirectionStep[];
}

const MODE_MAP: Record<string, TravelMode> = {
  walk: "walking",
  bike: "bicycling",
  transit: "transit",
  drive: "driving",
};

export function travelModeFromShort(
  mode: "walk" | "bike" | "transit" | "drive",
): TravelMode {
  return MODE_MAP[mode] ?? "walking";
}

export async function fetchDirections(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  mode: TravelMode,
): Promise<DirectionsResult | null> {
  const origin = `${originLat},${originLng}`;
  const destination = `${destLat},${destLng}`;
  const url = `${API_CONFIG.getBaseUrl()}/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as DirectionsResult;
  if (!data?.encodedPolyline || !Array.isArray(data.steps)) return null;
  return data;
}
