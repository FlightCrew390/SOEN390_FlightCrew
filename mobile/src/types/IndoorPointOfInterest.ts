export type IndoorPoiCategory = "washroom" | "fountain" | "stairs" | "elevator";

export interface IndoorPointOfInterest {
  id: string;
  name: string;
  category: IndoorPoiCategory;
  buildingCode: string;
  floor: number;
  latitude: number;
  longitude: number;
  description: string;
  x?: number;
  y?: number;
}
