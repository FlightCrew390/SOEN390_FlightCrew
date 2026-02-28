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
}

function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "-- min";
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return remaining > 0 ? `${hours} hr ${remaining} min` : `${hours} hr`;
}

function formatDistance(meters: number): string {
  if (meters <= 0) return "-- m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
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
function getManeuverIcon(maneuver: string): any {
  switch (maneuver) {
    case "DEPART":
      return "start";
    case "STRAIGHT":
      return "straight";
    case "RAMP_LEFT":
      return "ramp-left";
    case "RAMP_RIGHT":
      return "ramp-right";
    case "MERGE":
      return "merge";
    case "FORK_LEFT":
      return "fork-left";
    case "FORK_RIGHT":
      return "fork-right";
    case "FERRY":
      return "directions-ferry";
    case "TURN_LEFT":
      return "turn-left";
    case "TURN_SLIGHT_LEFT":
      return "turn-slight-left";
    case "TURN_SHARP_LEFT":
      return "turn-sharp-left";
    case "TURN_RIGHT":
      return "turn-right";
    case "TURN_SLIGHT_RIGHT":
      return "turn-slight-right";
    case "TURN_SHARP_RIGHT":
      return "turn-sharp-right";
    case "ROUNDABOUT_LEFT":
      return "roundabout-left";
    case "ROUNDABOUT_RIGHT":
      return "roundabout-right";
    case "UTURN_LEFT":
      return "u-turn-left";
    case "UTURN_RIGHT":
      return "u-turn-right";
    default:
      return "dot-circle";
  }
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
}: Readonly<DirectionPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);

  const distanceText = route ? formatDistance(route.distanceMeters) : "-- m";

  return (
    <>
      {/* Close button */}
      {visible && (
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
        pointerEvents={visible && building != null ? "auto" : "none"}
      >
        {building != null && (
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
              <ScrollView
                style={styles.stepScroll}
                showsVerticalScrollIndicator
                onStartShouldSetResponder={() => true}
              >
                {startBuilding && (
                  <View
                    key={`step-start-${startBuilding.buildingCode}`}
                    style={styles.stepRow}
                  >
                    <View style={styles.stepContent}>
                      <Text style={styles.stepInstruction}>
                        Exit{" "}
                        {startBuilding.buildingLongName ??
                          startBuilding.buildingCode}
                      </Text>
                    </View>
                    <View style={styles.startBuildingIcon}>
                      <FontAwesome5 name="walking" size={36} color="white" />
                    </View>
                  </View>
                )}
                {route.steps
                  .filter((step) => step.instruction.length > 0)
                  .map((step, idx) => (
                    <View
                      key={`step-${step.instruction}-${idx}`}
                      style={[
                        styles.stepRow,
                        idx % 2 === 1 && styles.stepRowEven,
                      ]}
                    >
                      <View style={styles.stepContent}>
                        <Text style={styles.stepInstruction}>
                          {step.instruction}
                        </Text>
                        <Text style={styles.stepMeta}>
                          {formatDistance(step.distanceMeters)}
                          {step.durationSeconds > 0
                            ? ` · ${formatDuration(step.durationSeconds)}`
                            : ""}
                        </Text>
                      </View>
                      <MaterialIcons
                        name={getManeuverIcon(step.maneuver)}
                        size={42}
                        color="#666"
                      />
                    </View>
                  ))}
              </ScrollView>
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
    </>
  );
}
