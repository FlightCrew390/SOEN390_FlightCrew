import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { getIndoorPoisForBuilding } from "../../services/IndoorPoiService";
import { IndoorPointOfInterest } from "../../types/IndoorPointOfInterest";
import BuildingAmenityMarker from "./BuildingAmenityMarker";

interface BuildingAmenityLayerProps {
  /** Building code to display amenities for (e.g. "H", "MB"). Null hides the layer. */
  readonly buildingCode: string | null;
}

/**
 * Renders amenity markers (washrooms, fountains, stairs, elevators)
 * for the selected building on the main map. Returns null when no building is selected.
 */
export default function BuildingAmenityLayer({
  buildingCode,
}: Readonly<BuildingAmenityLayerProps>) {
  const [pois, setPois] = useState<IndoorPointOfInterest[]>([]);

  useEffect(() => {
    if (!buildingCode) {
      setPois([]);
      return;
    }

    const fetchPois = async () => {
      try {
        const data = await getIndoorPoisForBuilding(buildingCode);
        setPois(data);
      } catch {
        setPois([]);
      }
    };

    fetchPois();
  }, [buildingCode]);

  if (!buildingCode) return null;

  return (
    <>
      {pois.map((poi) => (
        <BuildingAmenityMarker
          key={poi.id}
          poi={poi}
          onPress={() => {
            Alert.alert(poi.name, poi.description);
          }}
        />
      ))}
    </>
  );
}
