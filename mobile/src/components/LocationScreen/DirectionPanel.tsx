import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { COLORS, METRO_ACCESS_BUILDINGS } from "../../constants";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import type { RoutePreviews } from "../../hooks/useRoutePreviews";
import styles from "../../styles/DirectionPanel";
import { Building, StructureType } from "../../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  TRAVEL_MODE,
  TravelMode,
} from "../../types/Directions";
import { IndoorRoom } from "../../types/IndoorRoom";
import {
  getBirdsEyeDistanceText,
  getDirectionOriginCoords,
  getStartLocationText,
} from "../../utils/directionsUtils";
import { formatDuration } from "../../utils/formatHelper";
import Tooltip from "../common/Tooltip";
import DepartureTimePicker from "./DepartureTimePicker";
import RouteStatusDisplay from "./RouteStatusDisplay";
import StepsPanel from "./StepsPanel";
import TransportCard from "./TransportCard";

const TRANSPORT_OPTIONS: {
  mode: TravelMode;
  icon: ReturnType<typeof require>;
  label: string;
}[] = [
  {
    mode: TRAVEL_MODE.WALK,
    icon: require("../../../assets/walk.png"),
    label: "Walk",
  },
  {
    mode: TRAVEL_MODE.BICYCLE,
    icon: require("../../../assets/bike.png"),
    label: "Bike",
  },
  {
    mode: TRAVEL_MODE.TRANSIT,
    icon: require("../../../assets/train.png"),
    label: "Transit",
  },
  {
    mode: TRAVEL_MODE.DRIVE,
    icon: require("../../../assets/car.png"),
    label: "Drive",
  },
];

interface DirectionPanelProps {
  readonly visible: boolean;
  readonly building: Building | null;
  readonly roomLabel?: string | null;
  readonly startBuilding?: Building | null;
  readonly route: RouteInfo | null;
  readonly routeLoading: boolean;
  readonly routeError: string | null;
  readonly travelMode: TravelMode | null;
  readonly onTravelModeChange: (mode: TravelMode | null) => void;
  readonly userLocation?: { latitude: number; longitude: number } | null;
  readonly departureConfig: DepartureTimeConfig;
  readonly onDepartureConfigChange: (config: DepartureTimeConfig) => void;
  readonly onClose: () => void;
  readonly onOpenSearch?: () => void;
  readonly onResetStart?: () => void;
  readonly showSteps: boolean;
  readonly onShowSteps: () => void;
  readonly onHideSteps: () => void;
  readonly startRoom?: IndoorRoom | null;
  readonly destinationRoom?: IndoorRoom | null;
  readonly onOpenStartIndoor?: () => void;
  readonly onOpenIndoor?: () => void;
  readonly shuttleEligible?: boolean;
  readonly routePreviews?: RoutePreviews;
}

function StartLocationRow({
  startBuilding,
  startRoom,
  onOpenSearch,
  onResetStart,
}: Readonly<{
  startBuilding: Building | null | undefined;
  startRoom: IndoorRoom | null | undefined;
  onOpenSearch?: () => void;
  onResetStart?: () => void;
}>) {
  return (
    <View style={styles.changeStartWrapper}>
      <Pressable
        style={styles.changeStartRow}
        onPress={() => onOpenSearch?.()}
        disabled={!onOpenSearch}
        accessibilityLabel="Search locations to change directions start"
        accessibilityRole="button"
      >
        <Text style={styles.changeStartText} testID="start-location">
          {getStartLocationText(startBuilding, startRoom)}
        </Text>
        <Text style={styles.changeStart} testID="change-start">
          change
        </Text>
      </Pressable>
      {startBuilding != null && (
        <Pressable
          style={styles.resetStartRow}
          onPress={() => onResetStart?.()}
          disabled={!onResetStart}
          accessibilityLabel="Reset to current location"
          accessibilityRole="button"
        >
          <FontAwesome5
            name="location-arrow"
            size={11}
            color={COLORS.concordiaMaroon}
          />
          <Text style={styles.resetStartText} testID="reset-start">
            Use current location
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function BuildingDetails({ building }: Readonly<{ building: Building }>) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handlePress = (text: string) => {
    if (activeTooltip === text) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(text);
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setActiveTooltip((current) => (current === text ? null : current));
      }, 3000);
    }
  };

  return (
    <ScrollView
      style={styles.descriptionScroll}
      contentContainerStyle={{ paddingBottom: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.buildingLongName}>{building.buildingLongName}</Text>
      <View style={styles.addressRow}>
        <Text style={styles.buildingAddress}>{building.address}</Text>
      </View>
      {/* Extracted nested ternary for maintainability */}
      {(() => {
        if (building.structureType === StructureType.Point) {
          if (building.description) {
            return (
              <Text style={styles.buildingDetail}>{building.description}</Text>
            );
          }
          return null;
        } else {
          return (
            <Text style={styles.buildingDetail}>
              Building Code: {building.buildingCode}
            </Text>
          );
        }
      })()}
      <Text style={styles.buildingDetail}>
        Campus: {building.campus === "SGW" ? "Sir George Williams" : "Loyola"}
      </Text>
      {!!building.accessibilityInfo && building.accessibilityInfo !== "N/A" && (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}
        >
          {building.accessibilityInfo
            .toLowerCase()
            .includes("not accessible") ? (
            <Pressable
              onPress={() => handlePress("Not Accessible")}
              style={{ alignItems: "center", zIndex: 10 }}
            >
              <MaterialIcons
                name="not-accessible"
                size={22}
                color={COLORS.concordiaMaroon}
              />
              {activeTooltip === "Not Accessible" && (
                <Tooltip text="Not Accessible" align="left" />
              )}
            </Pressable>
          ) : (
            <>
              {(building.accessibilityInfo.toLowerCase().includes("ramp") ||
                building.accessibilityInfo
                  .toLowerCase()
                  .includes("accessible")) && (
                <Pressable
                  onPress={() => handlePress("Wheelchair Accessible")}
                  style={{
                    marginRight: 10,
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <MaterialIcons name="accessible" size={22} color="#2E7D32" />
                  {activeTooltip === "Wheelchair Accessible" && (
                    <Tooltip text="Wheelchair Accessible" align="left" />
                  )}
                </Pressable>
              )}
              {(building.accessibilityInfo.toLowerCase().includes("door") ||
                building.accessibilityInfo
                  .toLowerCase()
                  .includes("entrance")) && (
                <Pressable
                  onPress={() => handlePress("Automatic Door")}
                  style={{
                    marginRight: 10,
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <MaterialCommunityIcons
                    name="door-sliding"
                    size={22}
                    color="#2E7D32"
                  />
                  {activeTooltip === "Automatic Door" && (
                    <Tooltip text="Automatic Door" />
                  )}
                </Pressable>
              )}
              {(building.accessibilityInfo.toLowerCase().includes("elevator") ||
                building.accessibilityInfo.toLowerCase().includes("lift")) && (
                <Pressable
                  onPress={() => handlePress("Elevator")}
                  style={{
                    marginRight: 10,
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <MaterialIcons name="elevator" size={22} color="#2E7D32" />
                  {activeTooltip === "Elevator" && <Tooltip text="Elevator" />}
                </Pressable>
              )}
              {METRO_ACCESS_BUILDINGS.includes(building.buildingCode) && (
                <Pressable
                  testID="btn-metro-access"
                  onPress={() => handlePress("Metro Access")}
                  style={{
                    marginRight: 10,
                    alignItems: "center",
                    zIndex: 10,
                  }}
                >
                  <Image
                    source={require("../../../assets/metro.png")}
                    style={{ width: 22, height: 22 }}
                    resizeMode="contain"
                  />
                  {activeTooltip === "Metro Access" && (
                    <Tooltip text="Metro Access" />
                  )}
                </Pressable>
              )}
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function getShuttleIconColor(eligible: boolean, isActive: boolean): string {
  if (eligible && isActive) return "#9C2D2D";
  if (eligible) return "#6B6B6B";
  return "#B0B0B0";
}

function ShuttleCard({
  isActive,
  eligible,
  duration,
  onPress,
}: Readonly<{
  isActive: boolean;
  eligible: boolean;
  duration: string;
  onPress: () => void;
}>) {
  return (
    <Pressable
      style={[
        styles.transportCard,
        isActive && styles.transportCardActive,
        !eligible && styles.transportCardDisabled,
      ]}
      onPress={eligible ? onPress : undefined}
      disabled={!eligible}
      accessibilityLabel="Get directions by Shuttle"
      accessibilityRole="button"
      accessibilityState={{ disabled: !eligible }}
    >
      <MaterialCommunityIcons
        name="bus"
        size={36}
        color={getShuttleIconColor(eligible, isActive)}
      />
      <Text
        style={[
          styles.transportTime,
          isActive && styles.transportTimeActive,
          !eligible && styles.transportTimeDisabled,
        ]}
      >
        {eligible ? duration : "N/A"}
      </Text>
    </Pressable>
  );
}

export default function DirectionPanel({
  visible,
  building,
  roomLabel,
  startBuilding,
  route,
  routeLoading,
  routeError,
  travelMode,
  onTravelModeChange,
  userLocation,
  departureConfig,
  onDepartureConfigChange,
  onClose,
  onOpenSearch,
  onResetStart,
  showSteps,
  onShowSteps,
  onHideSteps,
  startRoom,
  destinationRoom,
  onOpenStartIndoor,
  onOpenIndoor,
  shuttleEligible,
  routePreviews,
}: Readonly<DirectionPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);

  // helper: get duration label for a mode
  const getDuration = (mode: TravelMode): string => {
    // If this mode is the active one and we have a full route, prefer that
    if (travelMode === mode && route) {
      return formatDuration(route.durationSeconds);
    }
    // Otherwise use the preview
    const preview = routePreviews?.[mode];
    if (preview != null) return formatDuration(preview);
    return "-- min";
  };

  const originCoords = getDirectionOriginCoords(
    startBuilding,
    startRoom,
    userLocation,
  );

  const distanceText = getBirdsEyeDistanceText(originCoords, building);

  return (
    <>
      {/* Close button */}
      {visible && !showSteps && (
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close direction panel"
          accessibilityRole="button"
        >
          <FontAwesome5 name="times" size={30} color={COLORS.concordiaMaroon} />
        </Pressable>
      )}

      <Animated.View
        style={[styles.container, animatedStyle]}
        pointerEvents={
          visible && building != null && !showSteps ? "auto" : "none"
        }
      >
        {building != null && !showSteps && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Directions</Text>
            </View>

            <View style={styles.buildingInfoRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.buildingName} numberOfLines={1}>
                  {roomLabel ?? building.buildingName ?? building.buildingCode}
                </Text>
                <Text style={styles.buildingAddress} numberOfLines={2}>
                  {roomLabel
                    ? (building.buildingName ?? building.buildingCode)
                    : (building.address ?? "")}
                </Text>
              </View>
              <Text style={styles.distanceText}>{distanceText}</Text>
            </View>

            <StartLocationRow
              startBuilding={startBuilding}
              startRoom={startRoom}
              onOpenSearch={onOpenSearch}
              onResetStart={onResetStart}
            />

            {/* Departure time picker */}
            <DepartureTimePicker
              config={departureConfig}
              onConfigChange={onDepartureConfigChange}
            />

            {/* Transport options */}
            <View style={styles.transportRow}>
              {TRANSPORT_OPTIONS.map(({ mode, icon, label }) => (
                <TransportCard
                  key={mode}
                  icon={icon}
                  label={label}
                  isActive={travelMode === mode}
                  duration={getDuration(mode)}
                  onPress={() =>
                    onTravelModeChange(travelMode === mode ? null : mode)
                  }
                />
              ))}
              <ShuttleCard
                isActive={travelMode === TRAVEL_MODE.SHUTTLE}
                eligible={shuttleEligible ?? false}
                duration={getDuration(TRAVEL_MODE.SHUTTLE)}
                onPress={() =>
                  onTravelModeChange(
                    travelMode === TRAVEL_MODE.SHUTTLE
                      ? null
                      : TRAVEL_MODE.SHUTTLE,
                  )
                }
              />
            </View>

            <RouteStatusDisplay loading={routeLoading} error={routeError} />

            {/* Shuttle unavailable message */}
            {travelMode === TRAVEL_MODE.SHUTTLE &&
              !routeLoading &&
              !routeError &&
              !route && (
                <View style={styles.errorRow}>
                  <MaterialIcons name="info-outline" size={18} color="#888" />
                  <Text style={styles.shuttleUnavailableText}>
                    Shuttle is not available at the selected time. Please try
                    another transport method.
                  </Text>
                </View>
              )}

            <View style={styles.divider} />

            {(route?.steps?.length ?? 0) > 0 && (
              <Pressable
                style={styles.viewStepsButton}
                onPress={onShowSteps}
                accessibilityLabel="View step-by-step directions"
                accessibilityRole="button"
              >
                <MaterialIcons
                  name="directions"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.viewStepsText}>View steps</Text>
                <FontAwesome5
                  name="chevron-right"
                  size={14}
                  color={COLORS.white}
                />
              </Pressable>
            )}

            {!route && !routeLoading && !routeError && (
              <BuildingDetails building={building} />
            )}
          </>
        )}
      </Animated.View>

      {/* Steps panel (slides over the direction panel) */}
      {showSteps && building != null && route && (
        <StepsPanel
          building={building}
          startBuilding={startBuilding}
          route={route}
          departureConfig={departureConfig}
          onBack={onHideSteps}
          startRoom={startRoom}
          destinationRoom={destinationRoom}
          onOpenStartIndoor={onOpenStartIndoor}
          onOpenIndoor={onOpenIndoor}
        />
      )}
    </>
  );
}
