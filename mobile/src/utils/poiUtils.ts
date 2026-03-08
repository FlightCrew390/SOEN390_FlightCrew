import { Building, StructureType } from "../types/Building";
import { PointOfInterest } from "../types/PointOfInterest";

/** Convert a PointOfInterest to a minimal Building object for the directions flow. */
export function poiToBuilding(poi: PointOfInterest): Building {
  return {
    campus: poi.campus,
    buildingCode: poi.name,
    buildingName: poi.name,
    buildingLongName: poi.name,
    address: poi.address,
    latitude: poi.latitude,
    longitude: poi.longitude,
    structureType: StructureType.Point,
    accessibilityInfo: "",
    description: poi.description,
  };
}
