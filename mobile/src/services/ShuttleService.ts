import { API_CONFIG } from "../constants";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export interface ShuttleDeparture {
  loyola_departure: string | null;
  sgw_departure: string | null;
  last_bus: boolean;
}

export interface ShuttleSchedule {
  day: string;
  no_service: boolean;
  service_start: string | null;
  service_end: string | null;
  departures: ShuttleDeparture[];
}

export interface ShuttleRouteCoord {
  latitude: number;
  longitude: number;
}

export interface ShuttleRoute {
  duration: string;
  distance: string;
  sgw_to_loyola: ShuttleRouteCoord[];
  loyola_to_sgw: ShuttleRouteCoord[];
}

export class ShuttleService {
  /**
   * Get the shuttle schedule for a given day from the backend.
   * Omit day to let the backend default to today.
   */
  static async fetchSchedule(day?: string): Promise<ShuttleSchedule> {
    const params = day ? `?day=${encodeURIComponent(day.toUpperCase())}` : "";
    const response = await fetch(`${API_BASE_URL}/shuttle/schedule${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shuttle schedule: ${response.status}`);
    }
    return response.json() as Promise<ShuttleSchedule>;
  }

  /**
   * Get the shuttle route polyline from the backend.
   */
  static async fetchRoute(): Promise<ShuttleRoute> {
    const response = await fetch(`${API_BASE_URL}/shuttle/route`);
    if (!response.ok) {
      throw new Error(`Failed to fetch shuttle route: ${response.status}`);
    }
    return response.json() as Promise<ShuttleRoute>;
  }
}
