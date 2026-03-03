import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/StepsPanel";
import { Building } from "../../types/Building";
import {
  DepartureTimeConfig,
  RouteInfo,
  TransitStepDetails,
} from "../../types/Directions";
import { formatDistance, formatDuration } from "../../utils/formatHelper";

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

/** Format a Date to "h:mm AM/PM" */
function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Parse an ISO time string; returns null on failure */
function parseTime(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Compute the departure time to use for calculating step timestamps.
 * For "arrive_by", we work backwards from the arrival time.
 */
function getDepartureDate(
  config: DepartureTimeConfig,
  routeDurationSeconds: number,
): Date {
  if (config.option === "arrive_by") {
    return new Date(config.date.getTime() - routeDurationSeconds * 1000);
  }
  if (config.option === "depart_at") {
    return config.date;
  }
  return new Date(); // "now"
}

function TransitBadge({ transit }: Readonly<{ transit: TransitStepDetails }>) {
  const departureParsed = parseTime(transit.departureTime);
  const arrivalParsed = parseTime(transit.arrivalTime);

  return (
    <View style={styles.transitBadge}>
      <View style={styles.transitLineRow}>
        <MaterialIcons
          name={getManeuverIcon(transit.vehicleType)}
          size={18}
          color={COLORS.white}
        />
        <Text style={styles.transitLineName}>
          {transit.lineShortName || transit.lineName || transit.vehicleName}
        </Text>
      </View>
      {transit.departureStopName ? (
        <Text style={styles.transitStop} numberOfLines={1}>
          From {transit.departureStopName}
          {departureParsed ? ` at ${formatTime(departureParsed)}` : ""}
        </Text>
      ) : null}
      {transit.arrivalStopName ? (
        <Text style={styles.transitStop} numberOfLines={1}>
          To {transit.arrivalStopName}
          {arrivalParsed ? ` at ${formatTime(arrivalParsed)}` : ""}
        </Text>
      ) : null}
      {transit.stopCount > 0 && (
        <Text style={styles.transitStopCount}>
          {transit.stopCount} stop{transit.stopCount === 1 ? "" : "s"}
        </Text>
      )}
    </View>
  );
}

interface StepsPanelProps {
  readonly building: Building;
  readonly startBuilding?: Building | null;
  readonly route: RouteInfo;
  readonly departureConfig: DepartureTimeConfig;
  readonly onBack: () => void;
}

export default function StepsPanel({
  building,
  startBuilding,
  route,
  departureConfig,
  onBack,
}: Readonly<StepsPanelProps>) {
  const distanceText = formatDistance(route.distanceMeters);
  const initialDeparture = getDepartureDate(
    departureConfig,
    route.durationSeconds,
  );

  // Pre-compute schedule-aware timestamps for each visible step.
  // For transit steps, snap the running clock to real Google schedule times.
  const visibleSteps = route.steps.filter(
    (step) => step.instruction.length > 0,
  );
  const stepTimes: Date[] = [];
  let clock = initialDeparture.getTime();
  for (const step of visibleSteps) {
    // If this is a transit step with a real departure time, snap to it
    const realDep = parseTime(step.transitDetails?.departureTime);
    if (realDep) {
      clock = realDep.getTime();
    }
    stepTimes.push(new Date(clock));

    // Advance the clock: prefer real arrival time, else add duration
    const realArr = parseTime(step.transitDetails?.arrivalTime);
    if (realArr) {
      clock = realArr.getTime();
    } else {
      clock += step.durationSeconds * 1000;
    }
  }

  // Departure = first step time; arrival = end of last step
  const departureDate = stepTimes.length > 0 ? stepTimes[0] : initialDeparture;
  const arrivalDate = new Date(clock);

  return (
    <View style={styles.container}>
      {/* Header with building info and back chevron */}
      <View style={styles.header}>
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
            {building.address ?? ""}
          </Text>
        </View>

        <Text style={styles.distanceText}>{distanceText}</Text>
      </View>

      {/* Departure & arrival summary */}
      <View style={styles.timeSummaryRow}>
        <View style={styles.timeSummaryItem}>
          <FontAwesome5 name="clock" size={13} color={COLORS.concordiaMaroon} />
          <Text style={styles.timeSummaryLabel}>Depart</Text>
          <Text style={styles.timeSummaryValue}>
            {formatTime(departureDate)}
          </Text>
        </View>
        <View style={styles.timeSummaryDivider} />
        <View style={styles.timeSummaryItem}>
          <FontAwesome5 name="flag-checkered" size={13} color="#555" />
          <Text style={styles.timeSummaryLabel}>Arrive</Text>
          <Text style={styles.timeSummaryValue}>{formatTime(arrivalDate)}</Text>
        </View>
        <View style={styles.timeSummaryDivider} />
        <View style={styles.timeSummaryItem}>
          <MaterialIcons name="timer" size={15} color="#555" />
          <Text style={styles.timeSummaryValue}>
            {formatDuration(route.durationSeconds)}
          </Text>
        </View>
      </View>

      {/* Step-by-step directions */}
      <ScrollView
        style={styles.stepScroll}
        contentContainerStyle={{ paddingBottom: 20 }}
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
                {startBuilding.buildingLongName ?? startBuilding.buildingCode}
              </Text>
            </View>
            <View style={styles.startBuildingIcon}>
              <FontAwesome5 name="walking" size={36} color="white" />
            </View>
          </View>
        )}
        {visibleSteps.map((step, idx) => (
          <View
            key={`step-${step.instruction}-${idx}`}
            style={[styles.stepRow, idx % 2 === 0 && styles.stepRowOdd]}
          >
            <View style={styles.stepContent}>
              <Text style={styles.stepTimestamp}>
                {formatTime(stepTimes[idx])}
              </Text>
              <Text style={styles.stepInstruction}>{step.instruction}</Text>
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
              name={getManeuverIcon(step.maneuver)}
              size={42}
              color={COLORS.textSecondary}
            />
          </View>
        ))}

        {/* Arrival row */}
        <View style={styles.stepRow}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTimestamp}>{formatTime(arrivalDate)}</Text>
            <Text style={styles.stepInstruction}>
              Arrive at {building.buildingName ?? building.buildingCode}
            </Text>
          </View>
          <MaterialIcons
            name="place"
            size={42}
            color={COLORS.concordiaMaroon}
          />
        </View>
      </ScrollView>
    </View>
  );
}
