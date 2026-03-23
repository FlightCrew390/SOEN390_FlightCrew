import React from "react";
import { Marker } from "react-native-maps";
import { Circle, Path } from "react-native-svg";
import { COLORS } from "../../constants";
import {
  IndoorPointOfInterest,
  IndoorPoiCategory,
} from "../../types/IndoorPointOfInterest";
import BaseMarkerIcon from "./BaseMarkerIcon";

interface BuildingAmenityMarkerProps {
  readonly poi: IndoorPointOfInterest;
  readonly onPress?: () => void;
}

/** Pure SVG paths for each amenity category — rendered inside the marker circle. */
function AmenityIcon({ category }: Readonly<{ category: IndoorPoiCategory }>) {
  const fill = COLORS.white;
  const stroke = COLORS.white;

  switch (category) {
    // Person silhouette (head + body)
    case "washroom":
      return (
        <>
          <Circle cx="20" cy="12" r="3" fill={fill} />
          <Path d="M16 18 L20 15 L24 18 L24 23 L16 23 Z" fill={fill} />
        </>
      );
    // Water droplet
    case "fountain":
      return (
        <Path
          d="M20 11 C20 11 14 18 14 21 C14 23.8 16.7 26 20 26 C23.3 26 26 23.8 26 21 C26 18 20 11 20 11 Z"
          fill={fill}
        />
      );
    // Staircase steps
    case "stairs":
      return (
        <Path
          d="M14 22 L14 19 L17 19 L17 16 L20 16 L20 13 L26 13 L26 22 Z"
          fill={fill}
        />
      );
    // Box with up/down arrows
    case "elevator":
      return (
        <>
          <Path
            d="M14 12 L26 12 L26 23 L14 23 Z"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
          <Path
            d="M18 17 L20 14 L22 17"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
          <Path
            d="M18 19 L20 22 L22 19"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
        </>
      );
    default:
      return <Circle cx="20" cy="16" r="5" fill={fill} />;
  }
}

export default function BuildingAmenityMarker({
  poi,
  onPress,
}: Readonly<BuildingAmenityMarkerProps>) {
  return (
    <Marker
      coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
      title={poi.name}
      description={`Floor ${poi.floor} — ${poi.description}`}
      accessibilityLabel={`${poi.name}, Floor ${poi.floor}, ${poi.description}`}
      anchor={{ x: 0.5, y: 1 }}
      onPress={onPress}
      testID="building-amenity-marker"
    >
      <BaseMarkerIcon color={COLORS.concordiaMaroon} scale={1.3}>
        <AmenityIcon category={poi.category} />
      </BaseMarkerIcon>
    </Marker>
  );
}
