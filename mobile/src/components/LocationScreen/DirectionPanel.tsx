import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { COLORS } from "../../constants";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import styles from "../../styles/DirectionPanel";
import { Building } from "../../types/Building";

interface DirectionPanelProps {
  readonly visible: boolean;
  readonly building: Building | null;
  readonly onClose: () => void;
}

export default function DirectionPanel({
  visible,
  building,
  onClose,
}: Readonly<DirectionPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);

  if (!visible || !building) return null;

  return (
    <>
      {/* Close button */}
      <Pressable
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close direction panel"
        accessibilityRole="button"
      >
        <FontAwesome5 name="times" size={30} color={COLORS.concordiaMaroon} />
      </Pressable>

      <Animated.View
        style={[styles.container, animatedStyle]}
        pointerEvents="auto"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Directions</Text>
        </View>

        {/* Body */}
        <View style={styles.body}>
          <Text style={styles.buildingName}>{building.buildingLongName}</Text>
          <Text style={styles.buildingAddress}>{building.address}</Text>
        </View>
      </Animated.View>
    </>
  );
}
