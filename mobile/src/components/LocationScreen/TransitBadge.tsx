import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/StepsPanel";
import { TransitStepDetails } from "../../types/Directions";
import { getManeuverIcon, parseTime } from "../../utils/directionsUtils";
import { formatTime } from "../../utils/formatHelper";

interface TransitBadgeProps {
  readonly transit: TransitStepDetails;
}

function shortenShuttleStopLabel(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("loyola")) return "Loyola";
  if (n.includes("sgw") || n.includes("hall")) return "SGW";
  return name;
}

export default function TransitBadge({ transit }: Readonly<TransitBadgeProps>) {
  const departureParsed = parseTime(transit.departureTime);
  const arrivalParsed = parseTime(transit.arrivalTime);

  const isShuttle = transit.lineName === "Concordia Shuttle";

  if (isShuttle) {
    const from = transit.departureStopName
      ? shortenShuttleStopLabel(transit.departureStopName)
      : "";
    const to = transit.arrivalStopName
      ? shortenShuttleStopLabel(transit.arrivalStopName)
      : "";
    const routeLine =
      from && to ? `${from} → ${to}` : from || to || "Between campuses";

    return (
      <View
        style={[
          styles.transitBadge,
          { backgroundColor: COLORS.concordiaMaroon },
        ]}
      >
        <View style={styles.transitLineRow}>
          <MaterialIcons
            name={getManeuverIcon(transit.vehicleType)}
            size={18}
            color={COLORS.white}
          />
          <Text style={styles.transitLineName}>Campus shuttle</Text>
        </View>
        <Text style={styles.transitStop} numberOfLines={1}>
          {routeLine}
        </Text>
      </View>
    );
  }

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
