import React from "react";
import { Polygon } from "react-native-maps";
import { COLORS } from "../../constants";
import { Building } from "../../types/Building";

interface BuildingPolygonProps {
  readonly building: Building;
}

export default function BuildingPolygon({ building }: BuildingPolygonProps) {
  if (!building.polygons || building.polygons.length === 0) {
    return null;
  }

  return (
    <>
      {building.polygons.map((polygonCoords, index) => {
        const isGrounds = building.structureType === "GROUNDS";
        return (
          <Polygon
            key={`${building.buildingCode}-${index}`}
            coordinates={polygonCoords}
            strokeColor={isGrounds ? "transparent" : COLORS.concordiaMaroon}
            fillColor={
              isGrounds ? "rgba(134, 134, 5, 0.3)" : "rgba(156, 45, 45, 0.3)"
            }
            strokeWidth={isGrounds ? 0 : 2}
          />
        );
      })}
    </>
  );
}
