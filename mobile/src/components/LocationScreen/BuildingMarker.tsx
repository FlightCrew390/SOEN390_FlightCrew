import { Marker } from "react-native-maps";
import { Path } from "react-native-svg";
import { COLORS } from "../../constants";
import useMarkerCallout from "../../hooks/useMarkerCallout";
import { Building } from "../../types/Building";
import BaseMarkerIcon from "./BaseMarkerIcon";

interface BuildingMarkerProps {
  readonly building: Building;
  readonly isCurrentBuilding?: boolean;
  readonly isSelected?: boolean;
  readonly isDirectionsOpen?: boolean;
  readonly onSelect?: () => void;
  readonly onDirectionPress?: () => void;
}

/** SVG paths that form the building icon inside the marker circle. */
function BuildingIcon() {
  return (
    <>
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
    </>
  );
}

export default function BuildingMarker({
  building,
  isCurrentBuilding = false,
  isSelected = false,
  isDirectionsOpen = false,
  onSelect,
  onDirectionPress,
}: Readonly<BuildingMarkerProps>) {
  const isHighlighted = isCurrentBuilding || isSelected;

  const markerRef = useMarkerCallout({
    showCallout: isSelected && !isDirectionsOpen,
    hideCallout: isDirectionsOpen && isSelected,
  });

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
      onCalloutPress={onDirectionPress}
    >
      <BaseMarkerIcon
        color={isHighlighted ? COLORS.concordiaBlue : COLORS.concordiaMaroon}
        scale={isHighlighted ? 1.3 : 1}
      >
        <BuildingIcon />
      </BaseMarkerIcon>
    </Marker>
  );
}
