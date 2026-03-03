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
} from "../../utils/formatHelper";

function TransitBadge({ transit }: Readonly<{ transit: TransitStepDetails }>) {
  const departureParsed = parseTime(transit.departureTime);
  const arrivalParsed = parseTime(transit.arrivalTime);

  return (
    <View style={styles.transitBadge}>
      <View style={styles.transitLineRow}>
        <MaterialIcons
          name={getManeuverIcon(transit.vehicleType) as any}
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
          {departureParsed ? ` at ${formatDateTime(departureParsed)}` : ""}
        </Text>
      ) : null}
      {transit.arrivalStopName ? (
        <Text style={styles.transitStop} numberOfLines={1}>
          To {transit.arrivalStopName}
          {arrivalParsed ? ` at ${formatDateTime(arrivalParsed)}` : ""}
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
  const { visibleSteps, stepTimes, departureDate, arrivalDate } =
    computeStepTimeline(route.steps, initialDeparture);

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
                {formatDateTime(stepTimes[idx])}
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
              name={getManeuverIcon(step.maneuver) as any}
              size={42}
              color={COLORS.textSecondary}
            />
          </View>
        ))}

        {/* Arrival row */}
        <View style={styles.stepRow}>
          <View style={styles.stepContent}>
            <Text style={styles.stepTimestamp}>
              {formatDateTime(arrivalDate)}
            </Text>
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
