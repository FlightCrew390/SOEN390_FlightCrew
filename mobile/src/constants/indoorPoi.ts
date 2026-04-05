import { IndoorPoiCategory } from "../types/IndoorPointOfInterest";

export const PRIMARY_AMENITY_CATEGORIES: IndoorPoiCategory[] = [
  "washroom",
  "fountain",
];

export const SECONDARY_AMENITY_CATEGORIES: IndoorPoiCategory[] = [
  "stairs",
  "elevator",
];

export const ALL_AMENITY_CATEGORIES: IndoorPoiCategory[] = [
  ...PRIMARY_AMENITY_CATEGORIES,
  ...SECONDARY_AMENITY_CATEGORIES,
];
