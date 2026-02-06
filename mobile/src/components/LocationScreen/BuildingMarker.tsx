import React from "react";
import { Marker } from "react-native-maps";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS, MAP_CONFIG } from "../../constants";
import { Building } from "../../types/Building";

interface BuildingMarkerProps {
  readonly building: Building;
}

function CustomMarker() {
  const { width, height } = MAP_CONFIG.markerSize;

  return (
    <Svg width={width} height={height} viewBox="0 0 40 40">
      <Circle cx="20" cy="20" r="14" fill={COLORS.shadowBlack} />
      <Circle cx="20" cy="16" r="14" stroke={COLORS.white} strokeWidth="4" />
      <Circle cx="20" cy="16" r="12" fill={COLORS.concordiaMaroon} />
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

export default function BuildingMarker({ building }: BuildingMarkerProps) {
  if (!building.latitude || !building.longitude) {
    return null;
  }

  return (
    <Marker
      coordinate={{
        latitude: building.latitude,
        longitude: building.longitude,
      }}
      title={building.buildingCode}
      description={building.buildingName}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
    >
      <CustomMarker />
    </Marker>
  );
}
