import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/StepsPanel";
import { Building } from "../../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  StepInfo,
} from "../../types/Directions";
import { IndoorRoom } from "../../types/IndoorRoom";
import {
  computeStepTimeline,
  getDepartureDate,
  getManeuverIcon,
  parseTime,
} from "../../utils/directionsUtils";
import {
  formatDateTime,
  formatDistance,
  formatDuration,
  formatShuttleNextDeparturePhrase,
} from "../../utils/formatHelper";
import { getFloorLabel } from "../../utils/indoorFloorUtils";
import TransitBadge from "./TransitBadge";

interface StepsPanelProps {
  readonly building: Building;
  readonly startBuilding?: Building | null;
  readonly route: RouteInfo;
  readonly departureConfig: DepartureTimeConfig;
  readonly onBack: () => void;
  readonly startRoom?: IndoorRoom | null;
  readonly destinationRoom?: IndoorRoom | null;
  readonly onOpenStartIndoor?: () => void;
  readonly onOpenIndoor?: () => void;
  readonly isIndoor?: boolean;
  readonly stepsOverride?: StepInfo[];
  readonly activeStepIndex?: number;
  readonly onStepPress?: (index: number) => void;
}

export default function StepsPanel({
  building,
  startBuilding,
  route,
  departureConfig,
  onBack,
  startRoom,
  destinationRoom,
  onOpenStartIndoor,
  onOpenIndoor,
  isIndoor = false,
  stepsOverride,
  activeStepIndex = -1,
  onStepPress,
}: Readonly<StepsPanelProps>) {
  const scrollRef = useRef<ScrollView>(null);
  const stepsToDisplay = stepsOverride ?? route.steps;
  const distanceText =
    route.distanceText ?? formatDistance(route.distanceMeters);
  const initialDeparture = getDepartureDate(
    departureConfig,
    route.durationSeconds,
  );
  const { visibleSteps, stepTimes, departureDate, arrivalDate } =
    computeStepTimeline(stepsToDisplay, initialDeparture);
  const lastActiveIndex = useRef(activeStepIndex);

  const shuttleStep = visibleSteps.find(
    (s) => s.transitDetails?.lineName === "Concordia Shuttle",
  );
  const shuttleDepartureTime = shuttleStep?.transitDetails?.departureTime
    ? parseTime(shuttleStep.transitDetails.departureTime)
    : null;
  const nextDeparturePhrase =
    shuttleDepartureTime != null
      ? formatShuttleNextDeparturePhrase(shuttleDepartureTime, departureConfig)
      : null;

  useEffect(() => {
    // Only scroll if the index actually changed and we are in a valid state
    if (
      activeStepIndex !== -1 &&
      scrollRef.current &&
      activeStepIndex !== lastActiveIndex.current
    ) {
      // Step height is roughly 56px (42px icon + 14px padding)
      // Scroll so that the NEXT step (the first incomplete one) is at the top
      const nextIdx = activeStepIndex + 1;
      const scrollY = Math.max(0, nextIdx * 56);
      scrollRef.current.scrollTo({
        y: scrollY,
        animated: true,
      });
    }
    lastActiveIndex.current = activeStepIndex;
  }, [activeStepIndex, visibleSteps.length]);

  const isSameBuildingRoomRoute =
    !!startRoom?.buildingId &&
    !!destinationRoom?.buildingId &&
    startRoom.buildingId === destinationRoom.buildingId;

  return (
    <View
      style={[
        styles.container,
        isIndoor && {
          bottom: undefined,
          height: "35%",
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
        },
      ]}
    >
      {/* Header with building info and back chevron */}
      <View
        style={[
          styles.header,
          isIndoor && { backgroundColor: "#d0d0d0", paddingTop: 50 },
        ]}
      >
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel="Back to directions"
          accessibilityRole="button"
        >
          <FontAwesome5
            name="chevron-left"
            size={22}
            color={COLORS.concordiaMaroon}
          />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.buildingName} numberOfLines={1}>
            {building.buildingName ?? building.buildingCode}
          </Text>
          <Text style={styles.buildingAddress} numberOfLines={2}>
            {isIndoor
              ? `Indoor Directions · Floor ${getFloorLabel(building.buildingCode, destinationRoom?.floor ?? 1)}`
              : (building.address ?? "")}
          </Text>
        </View>

        {!isIndoor && <Text style={styles.distanceText}>{distanceText}</Text>}
      </View>

      {!isIndoor && nextDeparturePhrase != null && (
        <View
          style={styles.nextDepartureBanner}
          accessibilityLabel={`Next Departure. ${nextDeparturePhrase}`}
        >
          <Text style={styles.nextDepartureLabel}>Next Departure</Text>
          <Text style={styles.nextDepartureValue}>{nextDeparturePhrase}</Text>
        </View>
      )}

      {/* Departure & arrival summary - Hide for indoor */}
      {!isIndoor && (
        <View style={styles.timeSummaryRow}>
          <View style={styles.timeSummaryItem}>
            <FontAwesome5
              name="clock"
              size={13}
              color={COLORS.concordiaMaroon}
            />
            <Text style={styles.timeSummaryLabel}>Depart</Text>
            <Text style={styles.timeSummaryValue}>
              {formatDateTime(departureDate)}
            </Text>
          </View>
          <View style={styles.timeSummaryDivider} />
          <View style={styles.timeSummaryItem}>
            <FontAwesome5 name="flag-checkered" size={13} color="#555" />
            <Text style={styles.timeSummaryLabel}>Arrive</Text>
            <Text style={styles.timeSummaryValue}>
              {formatDateTime(arrivalDate)}
            </Text>
          </View>
          <View style={styles.timeSummaryDivider} />
          <View style={styles.timeSummaryItem}>
            <MaterialIcons name="timer" size={15} color="#555" />
            <Text style={styles.timeSummaryValue}>
              {route.durationText ?? formatDuration(route.durationSeconds)}
            </Text>
          </View>
        </View>
      )}

      {/* Step-by-step directions */}
      <ScrollView
        ref={scrollRef}
        style={styles.stepScroll}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator
        onStartShouldSetResponder={() => true}
      >
        {startBuilding && !isIndoor && !isSameBuildingRoomRoute && (
          <View
            key={`step-start-${startBuilding.buildingCode}`}
            style={styles.stepRow}
          >
            <View style={styles.stepContent}>
              <Text style={styles.stepInstruction}>
                {startRoom
                  ? `Exit ${startBuilding.buildingCode} starting from room ${startRoom.label || startRoom.id}`
                  : `Exit ${startBuilding.buildingLongName ?? startBuilding.buildingCode}`}
              </Text>
              {startRoom && onOpenStartIndoor && (
                <Pressable
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={onOpenStartIndoor}
                  accessibilityLabel="Show Indoor Departure Map"
                  accessibilityRole="button"
                >
                  <FontAwesome5
                    name="map"
                    size={16}
                    color={COLORS.concordiaMaroon}
                  />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: COLORS.concordiaMaroon,
                      fontWeight: "500",
                      fontSize: 14,
                    }}
                  >
                    View Indoor Departure Map
                  </Text>
                </Pressable>
              )}
            </View>
            <View style={styles.startBuildingIcon}>
              <FontAwesome5 name="walking" size={36} color="white" />
            </View>
          </View>
        )}
        {visibleSteps.map((step, idx) => {
          const isCompleted = activeStepIndex !== -1 && idx <= activeStepIndex;

          return (
            <Pressable
              key={step.id}
              onPress={() => onStepPress?.(idx)}
              style={({ pressed }) => [
                styles.stepRow,
                idx % 2 === 0 && styles.stepRowOdd,
                isCompleted && { opacity: 0.5 },
                pressed && { backgroundColor: "#eee" },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Step ${idx + 1}: ${step.instruction}${isCompleted ? " (Completed)" : ""}`}
            >
              <View style={styles.stepContent}>
                {!isIndoor && (
                  <Text style={styles.stepTimestamp}>
                    {formatDateTime(stepTimes[idx])}
                  </Text>
                )}
                <Text
                  style={[
                    styles.stepInstruction,
                    isCompleted && { textDecorationLine: "line-through" },
                  ]}
                >
                  {step.instruction}
                </Text>
                <Text style={styles.stepMeta}>
                  {formatDistance(step.distanceMeters)}
                  {step.durationSeconds > 0
                    ? ` · ${formatDuration(step.durationSeconds)}`
                    : ""}
                </Text>
                {step.transitDetails && (
                  <TransitBadge transit={step.transitDetails} />
                )}
              </View>
              <MaterialIcons
                name={getManeuverIcon(step.maneuver) as any}
                size={42}
                color={isCompleted ? "#aaa" : COLORS.textSecondary}
              />
            </Pressable>
          );
        })}

        {/* Arrival row */}
        {!isIndoor && !isSameBuildingRoomRoute && (
          <View style={styles.stepRow}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTimestamp}>
                {formatDateTime(arrivalDate)}
              </Text>
              <Text style={styles.stepInstruction}>
                Arrive at {building.buildingName ?? building.buildingCode}
              </Text>
              {destinationRoom && onOpenIndoor && (
                <Pressable
                  style={{
                    marginTop: 12,
                    backgroundColor: COLORS.concordiaMaroon,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                  onPress={onOpenIndoor}
                  accessibilityLabel="Show Indoor Map"
                  accessibilityRole="button"
                >
                  <MaterialIcons
                    name="map"
                    size={18}
                    color={COLORS.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={{
                      color: COLORS.white,
                      fontWeight: "600",
                      fontSize: 14,
                    }}
                  >
                    Show Indoor Map
                  </Text>
                </Pressable>
              )}
            </View>
            <MaterialIcons
              name="place"
              size={42}
              color={COLORS.concordiaMaroon}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}
