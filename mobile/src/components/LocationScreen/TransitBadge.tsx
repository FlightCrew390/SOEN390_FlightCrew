import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/StepsPanel";
import { TransitStepDetails } from "../../types/Directions";
import { getManeuverIcon, parseTime } from "../../utils/directionsUtils";
import { formatDateTime } from "../../utils/formatHelper";

interface TransitBadgeProps {
  readonly transit: TransitStepDetails;
}

export default function TransitBadge({ transit }: Readonly<TransitBadgeProps>) {
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
