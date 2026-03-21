import { API_CONFIG } from "../constants";
import { IndoorRoom } from "../types/IndoorRoom";

export interface IndoorPathResponse {
  path: IndoorRoom[];
  distanceMeters: number;
  metadata: {
    startNodeId: string;
    endNodeId: string;
    accessible: boolean;
  };
}

export class IndoorPathfindingService {
  /**
   * Calculates the shortest path between two indoor nodes in the same building.
   * @param buildingId The ID of the building (e.g., 'hall')
   * @param startNodeId The ID of the start node
   * @param endNodeId The ID of the end node
   * @param accessible Whether the path must be accessible
   */
  static async getDirections(
    buildingId: string,
    startNodeId: string,
    endNodeId: string,
    accessible: boolean = false,
  ): Promise<IndoorPathResponse> {
    try {
      const url = new URL(`${API_CONFIG.getBaseUrl()}/indoor/directions`);
      url.searchParams.append("buildingId", buildingId);
      url.searchParams.append("startNodeId", startNodeId);
      url.searchParams.append("endNodeId", endNodeId);
      url.searchParams.append("requireAccessible", String(accessible));

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Indoor routing failed with status ${response.status}`);
      }

      return await response.json();
    } catch (e) {
      console.error("Error in IndoorPathfindingService:", e);
      throw e;
    }
  }
}
