import { Building } from "../types/Building";
import { API_CONFIG } from "../constants";

const API_BASE_URL = API_CONFIG.getBaseUrl();

export class BuildingDataService {
  static async fetchBuildings(): Promise<Building[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/facilities/buildinglist`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return data.map((building: any) => ({
        campus: building.Campus,
        buildingCode: building.Building,
        buildingName: building.Building_Name,
        buildingLongName: building.Building_Long_Name,
        address: building.Address,
        latitude: building.Latitude,
        longitude: building.Longitude,
        polygon: building.Google_Place_Info?.displayPolygon?.coordinates?.[0]
          ?.map((coord: any) => {
            if (
              Array.isArray(coord) &&
              coord.length >= 2 &&
              typeof coord[0] === "number" &&
              typeof coord[1] === "number"
            ) {
              return {
                latitude: coord[1],
                longitude: coord[0],
              };
            }
            return null;
          })
          .filter((p: any) => p !== null),
      }));
    } catch (error) {
      console.error("Error fetching buildings:", error);
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
