export interface Building {
  campus: string;
  buildingCode: string;
  buildingName: string;
  buildingLongName: string;
  address: string;
  latitude: number;
  longitude: number;
  structureType: StructureType;
  description?: string;
  polygons?: { latitude: number; longitude: number }[][];
  Google_Place_Info?: {
    displayName: { text: string };
  };
}

export enum StructureType {
  Building = "BUILDING",
  Grounds = "GROUNDS",
  Point = "POINT",
}

export type Campus = "SGW" | "LOY";
