import React, { useMemo } from "react";
import { getIndoorPoisForBuilding } from "../../services/IndoorPoiService";
import IndoorPoiMarker from "./IndoorPoiMarker";

interface IndoorPoiLayerProps {
  /** Building code to display POIs for (e.g. "H", "MB"). Null hides the layer. */
  readonly buildingCode: string | null;
}

/**
 * Renders indoor points of interest (washrooms, fountains, stairs, elevators)
 * for the selected building. Returns null when no building is selected.
 */
export default function IndoorPoiLayer({
  buildingCode,
}: Readonly<IndoorPoiLayerProps>) {
  const pois = useMemo(() => {
    if (!buildingCode) return [];
    try {
      return getIndoorPoisForBuilding(buildingCode);
    } catch {
      return [];
    }
  }, [buildingCode]);

  if (!buildingCode) return null;

  return (
    <>
      {pois.map((poi) => (
        <IndoorPoiMarker key={poi.id} poi={poi} />
      ))}
    </>
  );
}
