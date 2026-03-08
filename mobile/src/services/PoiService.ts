import { API_CONFIG } from "../constants";
import { PointOfInterest } from "../types/PointOfInterest";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export class PoiService {
  static async fetchPois(campus?: string): Promise<PointOfInterest[]> {
    try {
      const url = campus
        ? `${API_BASE_URL}/poi/list?campus=${encodeURIComponent(campus)}`
        : `${API_BASE_URL}/poi/list`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.map((poi: any) => ({
        name: poi.Name,
        category: poi.Category,
        campus: poi.Campus,
        address: poi.Address,
        latitude: poi.Latitude,
        longitude: poi.Longitude,
        description: poi.Description,
        googlePlaceInfo: poi.Google_Place_Info,
      }));
    } catch (error) {
      console.error("Error fetching POIs:", error);
      if (
        error instanceof TypeError &&
        error.message.includes("Network request failed")
      ) {
        throw new Error(
          "Cannot connect to server. Make sure the backend is running on port 9090.",
        );
      }
      throw error;
    }
  }
}
