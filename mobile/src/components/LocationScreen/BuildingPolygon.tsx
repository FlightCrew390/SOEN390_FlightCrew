import React from "react";
import { Polygon } from "react-native-maps";
import { COLORS } from "../../constants";
import { Building, StructureType } from "../../types/Building";

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
        const isGrounds = building.structureType === StructureType.Grounds;
        return (
          <Polygon
            key={`${building.buildingCode}-${index}`}
            coordinates={polygonCoords}
            strokeColor={isGrounds ? "transparent" : COLORS.concordiaMaroon}
            fillColor={isGrounds ? COLORS.groundsFill : COLORS.buildingFill}
            strokeWidth={isGrounds ? 0 : 2}
          />
        );
      })}
    </>
  );
}
