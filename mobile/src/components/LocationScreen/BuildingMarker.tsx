import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import { Marker } from "react-native-maps";
import Svg, { Circle, Path } from "react-native-svg";
import { COLORS, MAP_CONFIG } from "../../constants";
import { Building } from "../../types/Building";
import { styles } from "../../styles/BuildingMarkerStyle";

const ICONS = {
  walk: require("../../../assets/walk.png"),
  bike: require("../../../assets/bike.png"),
  train: require("../../../assets/train.png"),
  car: require("../../../assets/car.png"),
} as const;

export interface SelectedBuildingInfo {
  building: Building;
}

interface BuildingMarkerProps {
  readonly building: Building;
  readonly isCurrentBuilding?: boolean;
  readonly isSelected?: boolean;
  readonly onSelect?: (info: SelectedBuildingInfo) => void;
  readonly onDeselect?: () => void;
  readonly onDirectionPress?: () => void;
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
  onDirectionPress,
}: Readonly<BuildingMarkerProps>) {
  const markerRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (isSelected && markerRef.current) {
      setTimeout(() => {
        markerRef.current?.showCallout?.();
      }, 100);
    }
  }, [isSelected]);

  if (!building.latitude || !building.longitude) return null;

  return (
    <Marker
      ref={markerRef}
      coordinate={{
        latitude: building.latitude,
        longitude: building.longitude,
      }}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={false}
      onPress={() => onSelect?.({ building })}
      onCalloutPress={onDeselect}
    >
      <CustomMarker isHighlighted={isCurrentBuilding || isSelected} />
    </Marker>
  );
}

function TransportCard({
  icon,
}: Readonly<{ icon: ReturnType<typeof require> }>) {
  return (
    <View style={styles.transportCard}>
      <Image source={icon} style={styles.transportIcon} resizeMode="contain" />
      <Text style={styles.transportTime}>-- min</Text>
    </View>
  );
}

export function BuildingPopup({
  building,
  onClose,
}: Readonly<SelectedBuildingInfo & { onClose: () => void }>) {
  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <SafeAreaView pointerEvents="box-none">
        <View style={styles.card} pointerEvents="auto">
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Close building info"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.buildingName} numberOfLines={1}>
                {building.buildingName ?? building.buildingCode}
              </Text>
              <Text style={styles.buildingAddress} numberOfLines={2}>
                {building.address ?? ""}
              </Text>
            </View>
            <Text style={styles.distanceText}>-- m</Text>
          </View>

          <View style={styles.transportRow}>
            <TransportCard icon={ICONS.walk} />
            <TransportCard icon={ICONS.bike} />
            <TransportCard icon={ICONS.train} />
            <TransportCard icon={ICONS.car} />
          </View>

          <View style={styles.divider} />

          <ScrollView
            style={styles.descriptionScroll}
            showsVerticalScrollIndicator
            onStartShouldSetResponder={() => true}
          >
            <Text style={styles.buildingLongName}>
              {building.buildingLongName}
            </Text>
            <Text style={styles.buildingDetail}>
              Building Code: {building.buildingCode}
            </Text>
            <Text style={styles.buildingDetail}>
              Campus:{" "}
              {building.campus === "SGW" ? "Sir George Williams" : "Loyola"}
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
