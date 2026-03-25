export type IndoorNodeType =
  | "room"
  | "stair_landing"
  | "elevator_door"
  | "doorway"
  | "hallway_waypoint"
  | "building_entry_exit";

export interface IndoorNode {
  id: string;
  type: IndoorNodeType;
  buildingId: string;
  floor: number;
  x: number;
  y: number;
  label: string;
  accessible: boolean;
}

export interface IndoorRoom extends IndoorNode {
  type: "room";
}

export interface IndoorStep {
  instruction: string;
  maneuver: string;
  distanceMeters: number;
  durationSeconds: number;
  startFloor: number;
  endFloor: number;
  startNodeId: string;
  endNodeId: string;
}

export interface IndoorBuildingData {
  meta: { buildingId: string };
  nodes: IndoorNode[];
}
