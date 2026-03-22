import { API_CONFIG } from "../constants";
import { IndoorNode, IndoorRoom } from "../types/IndoorRoom";

const API_BASE_URL = API_CONFIG.getBaseUrl();

const DEFAULT_BUILDINGS = ["Hall", "CC", "MB", "VE", "VL"] as const;

const DEFAULT_FLOORS: Record<string, number[]> = {
  Hall: [1, 2, 8, 9],
  CC: [1],
  MB: [1, 2],
  VE: [1, 2],
  VL: [1, 2],
};

let allNodes: IndoorNode[] = [];
let availableBuildings: string[] = [...DEFAULT_BUILDINGS];
let isLoaded = false;
let loadingPromise: Promise<void> | null = null;

export class IndoorDataService {
  static async ensureLoaded(): Promise<void> {
    if (isLoaded) return;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
      try {
        const [buildingsRes, nodesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/indoor/buildings`),
          fetch(`${API_BASE_URL}/indoor/nodes`),
        ]);

        if (buildingsRes.ok) {
          const buildings = (await buildingsRes.json()) as string[];
          if (Array.isArray(buildings) && buildings.length > 0) {
            availableBuildings = buildings;
          }
        }

        if (nodesRes.ok) {
          const nodes = (await nodesRes.json()) as IndoorNode[];
          allNodes = Array.isArray(nodes) ? nodes : [];
          isLoaded = true;
        }
      } catch {
        // Keep defaults and allow UI to continue without crashing.
      }
    })();

    return loadingPromise;
  }

  static getAllNodes(): IndoorNode[] {
    return allNodes;
  }

  static getRooms(): IndoorRoom[] {
    return allNodes.filter((n): n is IndoorRoom => n.type === "room");
  }

  static getAvailableBuildings(): string[] {
    return availableBuildings;
  }

  static getFloorsByBuilding(buildingId: string): number[] {
    if (!buildingId) return [];

    const floors = new Set(
      allNodes.filter((n) => n.buildingId === buildingId).map((n) => n.floor),
    );

    const dynamicFloors = [...floors].sort((a, b) => a - b);
    if (dynamicFloors.length > 0) {
      return dynamicFloors;
    }

    return DEFAULT_FLOORS[buildingId] ?? [1];
  }

  static getRoomsByBuilding(buildingId: string): IndoorRoom[] {
    return allNodes.filter(
      (n): n is IndoorRoom => n.type === "room" && n.buildingId === buildingId,
    );
  }

  static getRoomsByBuildingAndFloor(
    buildingId: string,
    floor: number,
  ): IndoorRoom[] {
    return allNodes.filter(
      (n): n is IndoorRoom =>
        n.type === "room" && n.buildingId === buildingId && n.floor === floor,
    );
  }

  static searchRooms(query: string): IndoorRoom[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allNodes.filter(
      (n): n is IndoorRoom =>
        n.type === "room" && n.label.toLowerCase().includes(q),
    );
  }

  static searchRoomsByBuilding(
    query: string,
    buildingId: string,
  ): IndoorRoom[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allNodes.filter(
      (n): n is IndoorRoom =>
        n.type === "room" &&
        n.buildingId === buildingId &&
        n.label.toLowerCase().includes(q),
    );
  }
}
