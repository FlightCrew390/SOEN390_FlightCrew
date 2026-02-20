import React, { useEffect, useRef } from "react";
import { Marker, MapMarker } from "react-native-maps";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS, MAP_CONFIG } from "../../constants";
import { Building } from "../../types/Building";

interface BuildingMarkerProps {
  readonly building: Building;
  readonly isCurrentBuilding?: boolean;
  readonly isSelected?: boolean;
  readonly onSelect?: () => void;
  readonly onDeselect?: () => void;
}

function CustomMarker({ isHighlighted }: Readonly<{ isHighlighted: boolean }>) {
  const { width, height } = MAP_CONFIG.markerSize;
  const markerColor = isHighlighted
    ? COLORS.concordiaBlue
    : COLORS.concordiaMaroon;
  const markerSize = isHighlighted
    ? { width: width * 1.3, height: height * 1.3 }
    : { width, height };

  return (
    <Svg
      width={markerSize.width}
      height={markerSize.height}
      viewBox="0 0 40 40"
    >
      <Circle cx="20" cy="20" r="14" fill={COLORS.shadowBlack} />
      <Circle cx="20" cy="16" r="14" stroke={COLORS.white} strokeWidth="4" />
      <Circle cx="20" cy="16" r="12" fill={markerColor} />
      <Path
        d="M20 9L13 13.5L20 17.5L26.5 12.5L20 9Z"
        fill={COLORS.white}
        stroke={COLORS.white}
      />
      <Path
        d="M16 19.7093V15.4866C19.5 14.3918 23 15.4866 23 15.4866V19.7093C23 22.9937 16 22.5245 16 19.7093Z"
        fill={COLORS.white}
        stroke={COLORS.white}
      />
      <Path d="M26 13V19" stroke={COLORS.white} />
    </Svg>
  );
}

export default function BuildingMarker({
  building,
  isCurrentBuilding = false,
  isSelected = false,
  onSelect,
  onDeselect,
}: Readonly<BuildingMarkerProps>) {
  const markerRef = useRef<MapMarker>(null);

  // Programmatically show callout when selected via search
  useEffect(() => {
    if (isSelected && markerRef.current) {
      // Small delay to ensure the map has finished animating
      const timer = setTimeout(() => {
        markerRef.current?.showCallout();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  if (!building.latitude || !building.longitude) {
    return null;
  }

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: building.latitude,
        longitude: building.longitude,
      }}
      title={building.buildingCode}
      description={building.buildingName}
      anchor={{ x: 0.5, y: 1 }}
      onPress={onSelect}
      onCalloutPress={onDeselect}
    >
      <CustomMarker isHighlighted={isCurrentBuilding || isSelected} />
    </Marker>
  );
}
