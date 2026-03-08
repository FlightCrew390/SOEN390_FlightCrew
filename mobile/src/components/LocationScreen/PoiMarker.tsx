import React from "react";
import { Marker } from "react-native-maps";
import { Circle, Path } from "react-native-svg";
import { COLORS } from "../../constants";
import useMarkerCallout from "../../hooks/useMarkerCallout";
import { PointOfInterest, PoiCategory } from "../../types/PointOfInterest";
import BaseMarkerIcon from "./BaseMarkerIcon";

interface PoiMarkerProps {
  readonly poi: PointOfInterest;
  readonly isDirectionsOpen?: boolean;
  readonly onPress?: () => void;
  readonly onDirectionPress?: () => void;
}

/** Pure SVG paths for each POI category — rendered inside the marker circle. */
function CategoryPaths({ category }: Readonly<{ category: PoiCategory }>) {
  const fill = COLORS.white;
  const stroke = COLORS.white;

  switch (category) {
    // Coffee cup
    case "cafe":
      return (
        <>
          <Path
            d="M15 12H23V19C23 21.2 21.2 23 19 23C16.8 23 15 21.2 15 19Z"
            fill={fill}
          />
          <Path
            d="M23 14C24.7 14 26 15.3 26 17C26 18.7 24.7 20 23 20"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
          <Path
            d="M14 10Q16 8 18 10Q20 8 22 10"
            stroke={stroke}
            strokeWidth="1"
            fill="none"
          />
        </>
      );
    // Fork & knife
    case "restaurant":
      return (
        <>
          <Path d="M16 10V22" stroke={stroke} strokeWidth="1.5" />
          <Path d="M16 10L18 15H14Z" fill={fill} />
          <Path
            d="M22.5 10V13H24.5V10M23.5 13V22"
            stroke={stroke}
            strokeWidth="1.5"
          />
        </>
      );
    // Plus / cross
    case "pharmacy":
      return <Path d="M18 12H22V15H25V19H22V22H18V19H15V15H18Z" fill={fill} />;
    // Martini glass
    case "bar":
      return (
        <>
          <Path d="M14 10H26L20 17Z" fill={fill} />
          <Path d="M20 17V21" stroke={stroke} strokeWidth="1.5" />
          <Path d="M17 22H23" stroke={stroke} strokeWidth="1.5" />
        </>
      );
    // Shopping bag
    case "grocery":
      return (
        <>
          <Path d="M15 14H25V23H15Z" fill={fill} />
          <Path
            d="M17.5 14V12C17.5 10.3 18.6 9.5 20 9.5C21.4 9.5 22.5 10.3 22.5 12V14"
            stroke={stroke}
            strokeWidth="1.5"
            fill="none"
          />
        </>
      );
    default:
      // Simple pin dot
      return <Circle cx="20" cy="16" r="5" fill={fill} />;
  }
}

export default function PoiMarker({
  poi,
  isDirectionsOpen = false,
  onPress,
  onDirectionPress,
}: Readonly<PoiMarkerProps>) {
  const markerRef = useMarkerCallout({
    showCallout: !isDirectionsOpen,
    hideCallout: isDirectionsOpen,
    deps: [poi],
  });

  return (
    <Marker
      ref={markerRef}
      coordinate={{ latitude: poi.latitude, longitude: poi.longitude }}
      title={poi.name}
      description={poi.address}
      anchor={{ x: 0.5, y: 1 }}
      onPress={onPress}
      onCalloutPress={onDirectionPress}
      testID="poi-marker"
    >
      <BaseMarkerIcon color={COLORS.concordiaBlue} scale={1.3}>
        <CategoryPaths category={poi.category} />
      </BaseMarkerIcon>
    </Marker>
  );
}
