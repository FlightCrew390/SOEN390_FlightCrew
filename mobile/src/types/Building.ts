export interface Building {
  campus: string;
  buildingCode: string;
  buildingName: string;
  buildingLongName: string;
  address: string;
  latitude: number;
  longitude: number;
  polygons?: { latitude: number; longitude: number }[][];
}

export type Campus = "SGW" | "LOY";
