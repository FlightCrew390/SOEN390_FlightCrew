import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/StepsPanel";
import { Building } from "../../types/Building";
import { RouteInfo } from "../../types/Directions";

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

interface StepsPanelProps {
  readonly building: Building;
  readonly startBuilding?: Building | null;
  readonly route: RouteInfo;
  readonly onBack: () => void;
}

export default function StepsPanel({
  building,
  startBuilding,
  route,
  onBack,
}: Readonly<StepsPanelProps>) {
  const distanceText = formatDistance(route.distanceMeters);

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

      {/* Step-by-step directions */}
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
                {startBuilding.buildingLongName ?? startBuilding.buildingCode}
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
              style={[styles.stepRow, idx % 2 !== 1 && styles.stepRowOdd]}
            >
              <View style={styles.stepContent}>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
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
    </View>
  );
}
