import {
  IndoorBuildingData,
  IndoorNode,
  IndoorRoom,
} from "../types/IndoorRoom";

const buildingFiles: IndoorBuildingData[] = [
  require("../../buildings_plan_json/hall.json"),
  require("../../buildings_plan_json/cc1.json"),
  require("../../buildings_plan_json/mb_floors_combined.json"),
  require("../../buildings_plan_json/ve.json"),
  require("../../buildings_plan_json/vl_floors_combined.json"),
];

const allNodes: IndoorNode[] = buildingFiles.flatMap((f) => f.nodes);

export class IndoorDataService {
  static getAllNodes(): IndoorNode[] {
    return allNodes;
  }

  static getRooms(): IndoorRoom[] {
    return allNodes.filter((n): n is IndoorRoom => n.type === "room");
  }

  static getAvailableBuildings(): string[] {
    return buildingFiles.map((f) => f.meta.buildingId);
  }

  static getFloorsByBuilding(buildingId: string): number[] {
    const floors = new Set(
      allNodes
        .filter((n) => n.buildingId === buildingId && n.type === "room")
        .map((n) => n.floor),
    );
    return [...floors].sort((a, b) => a - b);
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
