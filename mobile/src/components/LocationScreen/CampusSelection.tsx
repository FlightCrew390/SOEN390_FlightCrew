import Entypo from "@expo/vector-icons/Entypo";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import styles from "../../styles/CampusSelection";

const CAMPUSES = ["SGW Campus", "Loyola Campus"] as const;
type Campus = (typeof CAMPUSES)[number];

interface CampusSelectionProps {
  onCampusChange?: (campus: Campus) => void;
}

export default function CampusSelection({
  onCampusChange,
}: CampusSelectionProps) {
  const [campusIndex, setCampusIndex] = useState(0);

  const isFirst = campusIndex === 0;
  const isLast = campusIndex === CAMPUSES.length - 1;

  const navigate = (direction: -1 | 1) => {
    const newIndex = campusIndex + direction;
    setCampusIndex(newIndex);
    onCampusChange?.(CAMPUSES[newIndex]);
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

      <Text style={styles.campusText}>{CAMPUSES[campusIndex]}</Text>

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
