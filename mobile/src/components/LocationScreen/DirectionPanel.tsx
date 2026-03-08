import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useCallback, useEffect, useState } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { COLORS, METRO_ACCESS_BUILDINGS } from "../../constants";
import { SHUTTLE_RIDE_MINUTES } from "../../constants/shuttle";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import {
  getAllTravelTimes,
  isCrossCampus as isCrossCampusRoute,
} from "../../services/GoogleDirectionsService";
import styles from "../../styles/DirectionPanel";
import { Building, StructureType } from "../../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  TravelMode,
} from "../../types/Directions";
import { formatDistance, formatDuration } from "../../utils/formatHelper";
import { decodePolyline } from "../../utils/polylineDecode";
import Tooltip from "../common/Tooltip";
import DepartureTimePicker from "./DepartureTimePicker";
import RouteStatusDisplay from "./RouteStatusDisplay";
import StepsPanel from "./StepsPanel";
import TransportCard from "./TransportCard";

const BASE_TRANSPORT_OPTIONS: {
  mode: TravelMode;
  icon: ReturnType<typeof require>;
  label: string;
}[] = [
  { mode: "WALK", icon: require("../../../assets/walk.png"), label: "Walk" },
  { mode: "BICYCLE", icon: require("../../../assets/bike.png"), label: "Bike" },
  {
    mode: "TRANSIT",
    icon: require("../../../assets/train.png"),
    label: "Transit",
  },
  { mode: "DRIVE", icon: require("../../../assets/car.png"), label: "Drive" },
];
const SHUTTLE_OPTION: {
  mode: TravelMode;
  iconName: string;
  label: string;
} = { mode: "SHUTTLE", iconName: "bus", label: "Shuttle" };

export interface RouteSegment {
  coordinates: { latitude: number; longitude: number }[];
  mode: "walk" | "shuttle";
}

interface TravelTimesState {
  walk: number;
  bike: number;
  transit: number;
  drive: number;
}

interface DirectionPanelProps {
  readonly visible: boolean;
  readonly building: Building | null;
  readonly startBuilding?: Building | null;
  readonly route: RouteInfo | null;
  readonly routeLoading: boolean;
  readonly routeError: string | null;
  readonly travelMode: TravelMode | null;
  readonly onTravelModeChange: (mode: TravelMode | null) => void;
  readonly departureConfig: DepartureTimeConfig;
  readonly onDepartureConfigChange: (config: DepartureTimeConfig) => void;
  readonly onClose: () => void;
  readonly onOpenSearch?: () => void;
  readonly onResetStart?: () => void;
  readonly showSteps: boolean;
  readonly onShowSteps: () => void;
  readonly onHideSteps: () => void;
  readonly userLocation?: { latitude: number; longitude: number } | null;
  readonly userCampus?: string | null;
  readonly onRouteReady?: (segments: RouteSegment[]) => void;
}

function StartLocationRow({
  startBuilding,
  onOpenSearch,
  onResetStart,
}: Readonly<{
  startBuilding: Building | null | undefined;
  onOpenSearch?: () => void;
  onResetStart?: () => void;
}>) {
  return (
    <View style={styles.changeStartWrapper}>
      <Pressable
        style={styles.changeStartRow}
        onPress={() => onOpenSearch?.()}
        disabled={!onOpenSearch}
        accessibilityLabel="Search buildings to change directions start"
        accessibilityRole="button"
      >
        <Text style={styles.changeStartText}>
          {startBuilding
            ? `Starting at ${startBuilding.buildingName ?? startBuilding.buildingCode}`
            : "Starting from your current location"}
        </Text>
        <Text style={styles.changeStart}>change</Text>
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
          <Text style={styles.resetStartText}>Use current location</Text>
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

const MODE_TO_KEY: Record<
  Exclude<TravelMode, "SHUTTLE">,
  keyof TravelTimesState
> = {
  WALK: "walk",
  BICYCLE: "bike",
  TRANSIT: "transit",
  DRIVE: "drive",
};

export default function DirectionPanel({
  visible,
  building,
  startBuilding,
  route,
  routeLoading,
  routeError,
  travelMode,
  onTravelModeChange,
  departureConfig,
  onDepartureConfigChange,
  onClose,
  onOpenSearch,
  onResetStart,
  showSteps,
  onShowSteps,
  onHideSteps,
  userLocation,
  userCampus,
  onRouteReady,
}: Readonly<DirectionPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);
  const [travelTimes, setTravelTimes] = useState<TravelTimesState | null>(null);
  const [loadingTravelTimes, setLoadingTravelTimes] = useState(false);
  const [error, setError] = useState(false);

  const showShuttle =
    userCampus && building
      ? isCrossCampusRoute(userCampus, building.campus)
      : false;

  const transportOptions = React.useMemo(
    () =>
      showShuttle
        ? [...BASE_TRANSPORT_OPTIONS, SHUTTLE_OPTION]
        : BASE_TRANSPORT_OPTIONS,
    [showShuttle],
  );

  useEffect(() => {
    if (!visible || !building || !userLocation || !userCampus) {
      setTravelTimes(null);
      setError(false);
      onRouteReady?.([]);
      return;
    }
    const origin = userLocation;
    const dest = {
      latitude: building.latitude,
      longitude: building.longitude,
    };
    let cancelled = false;
    setLoadingTravelTimes(true);
    setError(false);
    getAllTravelTimes(origin, dest)
      .then((result) => {
        if (!cancelled) {
          setError(false);
          setTravelTimes({
            walk: result.walk.durationMinutes,
            bike: result.bike.durationMinutes,
            transit: result.transit.durationMinutes,
            drive: result.drive.durationMinutes,
          });
          if (onRouteReady) {
            onRouteReady([
              {
                coordinates: decodePolyline(result.walk.polyline),
                mode: "walk",
              },
            ]);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTravelTimes(null);
          setError(false);
          onRouteReady?.([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingTravelTimes(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, building, userLocation, userCampus, onRouteReady]);

  const handleTransportPress = useCallback(
    (mode: TravelMode) => {
      onTravelModeChange(travelMode === mode ? null : mode);
    },
    [travelMode, onTravelModeChange],
  );

  const distanceText = travelTimes
    ? `${travelTimes.walk} min walk`
    : route
      ? (route.distanceText ?? formatDistance(route.distanceMeters))
      : "-- m";

  const getDurationForMode = (mode: TravelMode): string => {
    if (mode === "SHUTTLE") {
      if (travelTimes) return `~${SHUTTLE_RIDE_MINUTES} min`;
      if (travelMode === "SHUTTLE" && route) {
        return route.durationText ?? formatDuration(route.durationSeconds);
      }
      return "-- min";
    }
    if (travelTimes) {
      const key = MODE_TO_KEY[mode];
      return `${travelTimes[key]} min`;
    }
    if (travelMode === mode && route) {
      return formatDuration(route.durationSeconds);
    }
    return "-- min";
  };

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
                  {building.buildingName ?? building.buildingCode}
                </Text>
                <Text style={styles.buildingAddress} numberOfLines={2}>
                  {building.address ?? ""}
                </Text>
              </View>
              <Text style={styles.distanceText}>{distanceText}</Text>
            </View>

            <View style={styles.startRowWithShuttle}>
              <View style={styles.startRowLeft}>
                <StartLocationRow
                  startBuilding={startBuilding}
                  onOpenSearch={onOpenSearch}
                  onResetStart={onResetStart}
                />
              </View>
            </View>

            {/* Departure time picker */}
            <DepartureTimePicker
              config={departureConfig}
              onConfigChange={onDepartureConfigChange}
            />

            {/* Transport options */}
            <View style={styles.transportRow}>
              {transportOptions.map((option) => (
                <TransportCard
                  key={option.mode}
                  icon={"icon" in option ? option.icon : undefined}
                  iconName={"iconName" in option ? option.iconName : undefined}
                  label={option.label}
                  isActive={travelMode === option.mode}
                  duration={
                    loadingTravelTimes
                      ? "-- min"
                      : getDurationForMode(option.mode)
                  }
                  mode={option.mode}
                  onSelectMode={handleTransportPress}
                />
              ))}
            </View>

            {error && !loadingTravelTimes && (
              <Text style={styles.buildingDetail}>
                Could not load directions. Please try again.
              </Text>
            )}

            <RouteStatusDisplay loading={routeLoading} error={routeError} />

            <View style={styles.divider} />

            {route &&
            (route.steps.length > 0 || route.coordinates.length >= 2) ? (
              <Pressable
                style={styles.viewStepsButton}
                onPress={onShowSteps}
                accessibilityLabel="View route"
                accessibilityRole="button"
              >
                <MaterialIcons
                  name="directions"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.viewStepsText}>View route</Text>
                <FontAwesome5
                  name="chevron-right"
                  size={14}
                  color={COLORS.white}
                />
              </Pressable>
            ) : (
              !routeLoading &&
              !routeError && <BuildingDetails building={building} />
            )}
          </>
        )}
      </Animated.View>

      {/* Steps panel */}
      {showSteps && building != null && route && (
        <StepsPanel
          building={building}
          startBuilding={startBuilding}
          route={route}
          departureConfig={departureConfig}
          onBack={onHideSteps}
        />
      )}
    </>
  );
}
