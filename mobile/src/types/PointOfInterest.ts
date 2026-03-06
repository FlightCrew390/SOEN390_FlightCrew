export interface PointOfInterest {
  name: string;
  category: PoiCategory;
  campus: string;
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  googlePlaceInfo?: {
    displayName?: { text: string };
  };
}

export type PoiCategory =
  | "cafe"
  | "restaurant"
  | "pharmacy"
  | "bar"
  | "grocery";
