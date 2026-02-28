import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { COLORS } from "../../constants";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import styles from "../../styles/DirectionPanel";
import { Building } from "../../types/Building";
import { RouteInfo, TravelMode } from "../../types/Directions";
import { formatDistance, formatDuration } from "../../utils/formatHelper";
import StepsPanel from "./StepsPanel";

const TRANSPORT_OPTIONS: {
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

interface DirectionPanelProps {
  readonly visible: boolean;
  readonly building: Building | null;
  readonly startBuilding?: Building | null;
  readonly route: RouteInfo | null;
  readonly routeLoading: boolean;
  readonly routeError: string | null;
  readonly travelMode: TravelMode | null;
  readonly onTravelModeChange: (mode: TravelMode | null) => void;
  readonly onClose: () => void;
  readonly onOpenSearch?: () => void;
  readonly onResetStart?: () => void;
  readonly showSteps: boolean;
  readonly onShowSteps: () => void;
  readonly onHideSteps: () => void;
}

function TransportCard({
  icon,
  label,
  duration,
  isActive,
  onPress,
}: Readonly<{
  icon: ReturnType<typeof require>;
  label: string;
  duration: string;
  isActive: boolean;
  onPress: () => void;
}>) {
  return (
    <Pressable
      style={[styles.transportCard, isActive && styles.transportCardActive]}
      onPress={onPress}
      accessibilityLabel={`Get directions by ${label}`}
      accessibilityRole="button"
    >
      <Image
        source={icon}
        style={[styles.transportIcon, isActive && styles.transportIconActive]}
        resizeMode="contain"
      />
      <Text
        style={[styles.transportTime, isActive && styles.transportTimeActive]}
      >
        {duration}
      </Text>
    </Pressable>
  );
}
export default function DirectionPanel({
  visible,
  building,
  startBuilding,
  route,
  routeLoading,
  routeError,
  travelMode,
  onTravelModeChange,
  onClose,
  onOpenSearch,
  onResetStart,
  showSteps,
  onShowSteps,
  onHideSteps,
}: Readonly<DirectionPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);

  const distanceText = route ? formatDistance(route.distanceMeters) : "-- m";

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

            {/* Change start location */}
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
                  <Text style={styles.resetStartText}>
                    Use current location
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Transport options */}
            <View style={styles.transportRow}>
              {TRANSPORT_OPTIONS.map(({ mode, icon, label }) => (
                <TransportCard
                  key={mode}
                  icon={icon}
                  label={label}
                  isActive={travelMode === mode}
                  duration={
                    travelMode === mode && route
                      ? formatDuration(route.durationSeconds)
                      : "-- min"
                  }
                  onPress={() =>
                    onTravelModeChange(travelMode === mode ? null : mode)
                  }
                />
              ))}
            </View>

            {/* Loading / error / route states */}
            {routeLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.concordiaMaroon}
                />
                <Text style={styles.loadingText}>Calculating route…</Text>
              </View>
            )}

            {routeError != null && !routeLoading && (
              <View style={styles.errorRow}>
                <FontAwesome5
                  name="exclamation-circle"
                  size={14}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{routeError}</Text>
              </View>
            )}

            <View style={styles.divider} />

            {route && route.steps.length > 0 ? (
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
            ) : (
              <ScrollView
                style={styles.descriptionScroll}
                showsVerticalScrollIndicator={false}
              >
                {!routeLoading && !routeError && (
                  <>
                    <Text style={styles.buildingLongName}>
                      {building.buildingLongName}
                    </Text>
                    <View style={styles.addressRow}>
                      <Text style={styles.buildingAddress}>
                        {building.address}
                      </Text>
                    </View>
                    <Text style={styles.buildingDetail}>
                      Building Code: {building.buildingCode}
                    </Text>
                    <Text style={styles.buildingDetail}>
                      Campus:{" "}
                      {building.campus === "SGW"
                        ? "Sir George Williams"
                        : "Loyola"}
                    </Text>
                  </>
                )}
              </ScrollView>
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
          onBack={onHideSteps}
        />
      )}
    </>
  );
}
