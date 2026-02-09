import Entypo from "@expo/vector-icons/Entypo";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { CAMPUSES, CampusId } from "../../constants/campuses";
import styles from "../../styles/CampusSelection";

interface CampusSelectionProps {
  onCampusChange?: (campus: CampusId) => void;
  /** When set (e.g. from GPS), the selector shows this campus. */
  currentCampusId?: CampusId | null;
  /** Increment when user taps recenter so selector syncs back to actual campus. */
  recenterTrigger?: number;
}

const campusIds = Object.keys(CAMPUSES) as CampusId[];

export default function CampusSelection({
  onCampusChange,
  currentCampusId,
  recenterTrigger,
}: Readonly<CampusSelectionProps>) {
  const [campusIndex, setCampusIndex] = useState(0);

  useEffect(() => {
    if (currentCampusId == null) return;
    const index = campusIds.indexOf(currentCampusId);
    if (index !== -1) setCampusIndex(index);
  }, [currentCampusId, recenterTrigger]);

  const isFirst = campusIndex === 0;
  const isLast = campusIndex === campusIds.length - 1;

  const navigate = (direction: -1 | 1) => {
    const newIndex = campusIndex + direction;
    setCampusIndex(newIndex);
    onCampusChange?.(campusIds[newIndex]);
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
