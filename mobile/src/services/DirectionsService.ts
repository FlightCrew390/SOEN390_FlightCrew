import { API_CONFIG } from "../constants";
import {
  DirectionsResponse,
  RouteInfo,
  StepInfo,
  TransitStepDetails,
  TravelMode,
} from "../types/Directions";
import { decodePolyline } from "../utils/polylineDecode";

const API_BASE_URL = API_CONFIG.getBaseUrl();

function parseDuration(raw: string | undefined): number {
  if (!raw) return 0;
  return Math.round(Number.parseFloat(raw.replace("s", "")));
}

export class DirectionsService {
  /**
   * Fetch directions between two points from the backend.
   * Returns null when the backend returns 204 (no route) or on quota errors.
   */
  static async fetchDirections(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number,
    travelMode: TravelMode = "WALK",
    departureTime?: string,
    arrivalTime?: string,
  ): Promise<RouteInfo | null> {
    const params = new URLSearchParams({
      originLat: originLat.toString(),
      originLng: originLng.toString(),
      destLat: destLat.toString(),
      destLng: destLng.toString(),
      travelMode,
    });

    if (departureTime) {
      params.set("departureTime", departureTime);
    }
    if (arrivalTime) {
      params.set("arrivalTime", arrivalTime);
    }

    const url = `${API_BASE_URL}/directions?${params}`;

    try {
      const response = await fetch(url);

      if (response.status === 204) {
        // No route found
        return null;
      }

      if (response.status === 429) {
        throw new Error("Directions quota exceeded. Please try again later.");
      }

      if (!response.ok) {
        throw new Error(`Directions request failed: ${response.status}`);
      }

      const data: DirectionsResponse = await response.json();
      return parseRoute(data);
    } catch (error) {
      console.error("Error fetching directions:", error);
      throw error;
    }
  }
}

/** Convert the raw API response into a flat RouteInfo the UI can consume. */
function parseRoute(data: DirectionsResponse): RouteInfo | null {
  if (!data.routes || data.routes.length === 0) return null;

  const route = data.routes[0];
  const coordinates = route.polyline?.encodedPolyline
    ? decodePolyline(route.polyline.encodedPolyline)
    : [];

  const steps: StepInfo[] = [];
  for (const leg of route.legs ?? []) {
    for (const step of leg.steps ?? []) {
      const parsed: StepInfo = {
        distanceMeters: step.distanceMeters ?? 0,
        durationSeconds: parseDuration(step.staticDuration),
        instruction: step.navigationInstruction?.instructions ?? "",
        maneuver: step.navigationInstruction?.maneuver ?? "",
        coordinates: step.polyline?.encodedPolyline
          ? decodePolyline(step.polyline.encodedPolyline)
          : [],
        travelMode: step.travelMode, // Preserve travel mode for step-level coloring
      };

      // Parse transit details if present
      if (step.transitDetails) {
        const td = step.transitDetails;
        const transit: TransitStepDetails = {
          departureStopName: td.stopDetails?.departureStop?.name ?? "",
          arrivalStopName: td.stopDetails?.arrivalStop?.name ?? "",
          departureTime: td.stopDetails?.departureTime ?? "",
          arrivalTime: td.stopDetails?.arrivalTime ?? "",
          lineName: td.transitLine?.name ?? "",
          lineShortName: td.transitLine?.nameShort ?? "",
          vehicleType: td.transitLine?.vehicle?.type ?? "",
          vehicleName: td.transitLine?.vehicle?.name?.text ?? "",
          stopCount: td.stopCount ?? 0,
        };
        parsed.transitDetails = transit;
      }

      steps.push(parsed);
    }
  }

  return {
    coordinates,
    distanceMeters: route.distanceMeters ?? 0,
    durationSeconds: parseDuration(route.duration),
    steps,
  };
}
