import { API_CONFIG } from "../constants";
import { IndoorPointOfInterest } from "../types/IndoorPointOfInterest";

const API_BASE_URL = API_CONFIG.getBaseUrl();

/**
 * Fetches indoor points of interest for a given building code from the backend.
 * Building codes must be uppercase (e.g. "H", "MB", "EV").
 * Returns an empty array if the code is empty or if the fetch fails.
 */
export async function getIndoorPoisForBuilding(
  buildingCode: string,
): Promise<IndoorPointOfInterest[]> {
  const code = buildingCode.trim().toUpperCase();
  if (!code) return [];

  try {
    const response = await fetch(
      `${API_BASE_URL}/indoor/pois?buildingCode=${code}`,
    );
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch indoor POIs for building ${code}:`, error);
    return [];
  }
}

/**
 * Fetches all indoor points of interest from all buildings.
 */
export async function getAllIndoorPois(): Promise<IndoorPointOfInterest[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/indoor/pois`);
    if (!response.ok) return [];
    return response.json();
  } catch (error) {
    console.error("Failed to fetch all indoor POIs:", error);
    return [];
  }
}
