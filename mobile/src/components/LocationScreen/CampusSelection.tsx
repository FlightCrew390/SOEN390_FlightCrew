import { Pressable, Text, View } from "react-native";
import { CAMPUSES, CampusId } from "../../constants/campuses";
import styles from "../../styles/CampusSelection";

interface CampusSelectionProps {
  activeCampusId: CampusId;
  onCampusChange: (campus: CampusId) => void;
}

const campusOptions: CampusId[] = ["SGW", "LOYOLA"];

export default function CampusSelection({
  activeCampusId,
  onCampusChange,
}: Readonly<CampusSelectionProps>) {
  return (
    <View style={styles.container}>
      <Text style={styles.infoText}>Select a Campus</Text>
      <View style={styles.toggleContainer} accessibilityRole="tablist">
        {campusOptions.map((campusId) => {
          const isActive = campusId === activeCampusId;
          const label = campusId === "LOYOLA" ? "Loyola" : campusId;

          return (
            <Pressable
              key={campusId}
              onPress={() => onCampusChange(campusId)}
              style={[
                styles.toggleOption,
                isActive && styles.toggleOptionActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${CAMPUSES[campusId].name} selector`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  isActive && styles.toggleLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
