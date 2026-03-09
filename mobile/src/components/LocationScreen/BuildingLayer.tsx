import { Building } from "../../types/Building";
import BuildingMarker from "./BuildingMarker";
import BuildingPolygon from "./BuildingPolygon";

interface BuildingLayerProps {
  readonly buildings: Building[];
  readonly currentBuildingCode: string | null;
  readonly selectedBuildingCode: string | null;
  readonly isDirectionsOpen: boolean;
  readonly onSelect: (building: Building) => void;
  readonly onDirectionPress: (building: Building) => void;
}

/**
 * Renders all building polygons and markers on the map.
 */
export default function BuildingLayer({
  buildings,
  currentBuildingCode,
  selectedBuildingCode,
  isDirectionsOpen,
  onSelect,
  onDirectionPress,
}: Readonly<BuildingLayerProps>) {
  return (
    <>
      {buildings.flatMap((building) => [
        <BuildingPolygon
          key={`${building.buildingCode}-poly`}
          building={building}
        />,
        <BuildingMarker
          key={`${building.buildingCode}-marker`}
          building={building}
          isCurrentBuilding={currentBuildingCode === building.buildingCode}
          isSelected={selectedBuildingCode === building.buildingCode}
          isDirectionsOpen={isDirectionsOpen}
          onSelect={() => onSelect(building)}
          onDirectionPress={() => onDirectionPress(building)}
        />,
      ])}
    </>
  );
}
