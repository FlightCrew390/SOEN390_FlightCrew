import { API_CONFIG } from "../constants";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export interface ShuttleCoordinate {
  latitude: number;
  longitude: number;
}

export interface ShuttleRouteResponse {
  duration: string;
  distance: string;
  sgw_to_loyola: ShuttleCoordinate[];
  loyola_to_sgw: ShuttleCoordinate[];
}

export interface ShuttleDeparture {
  loyola_departure: string;
  sgw_departure: string | null;
  last_bus: boolean;
}

export interface ShuttleScheduleResponse {
  day: string;
  no_service: boolean;
  service_start: string | null;
  service_end: string | null;
  departures: ShuttleDeparture[];
}

export const ShuttleService = {
  async getRoute(): Promise<ShuttleRouteResponse> {
    const res = await fetch(`${API_BASE_URL}/shuttle/route`);
    if (!res.ok) throw new Error(`Shuttle route failed: ${res.status}`);
    return res.json();
  },

  async getSchedule(day?: string): Promise<ShuttleScheduleResponse> {
    const query = day ? `?day=${day}` : "";
    const res = await fetch(`${API_BASE_URL}/shuttle/schedule${query}`);
    if (!res.ok) throw new Error(`Shuttle schedule failed: ${res.status}`);
    return res.json();
  },
};
