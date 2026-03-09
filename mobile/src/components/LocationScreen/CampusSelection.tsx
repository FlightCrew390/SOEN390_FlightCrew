import Entypo from "@expo/vector-icons/Entypo";
import { Pressable, Text, View } from "react-native";
import { CAMPUSES, CampusId } from "../../constants/campuses";
import styles from "../../styles/CampusSelection";

interface CampusSelectionProps {
  activeCampusId: CampusId;
  onCampusChange: (campus: CampusId) => void;
}

const campusIds = Object.keys(CAMPUSES) as CampusId[];

export default function CampusSelection({
  activeCampusId,
  onCampusChange,
}: Readonly<CampusSelectionProps>) {
  const campusIndex = campusIds.indexOf(activeCampusId);
  const isFirst = campusIndex === 0;
  const isLast = campusIndex === campusIds.length - 1;

  const navigate = (direction: -1 | 1) => {
    onCampusChange(campusIds[campusIndex + direction]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Select a Campus</Text>

      <Pressable
        onPress={() => navigate(-1)}
        style={styles.chevronLeft}
        disabled={isFirst}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Previous campus"
      >
        <Entypo
          name="chevron-left"
          size={30}
          color="white"
          style={[styles.chevron, isFirst && styles.chevronDisabled]}
        />
      </Pressable>

      <Text style={styles.campusText}>
        {CAMPUSES[campusIds[campusIndex]].name}
      </Text>

      <Pressable
        onPress={() => navigate(1)}
        style={styles.chevronRight}
        disabled={isLast}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Next campus"
      >
        <Entypo
          name="chevron-right"
          size={30}
          color="white"
          style={[styles.chevron, isLast && styles.chevronDisabled]}
        />
      </Pressable>
    </View>
  );
}
