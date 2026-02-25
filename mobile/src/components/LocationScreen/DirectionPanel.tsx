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
  readonly onOpenSearch?: () => void;
}

export default function DirectionPanel({
  visible,
  building,
  onClose,
  onOpenSearch,
}: Readonly<DirectionPanelProps>) {
  const { animatedStyle } = usePanelAnimation(visible);

  return (
    <>
      {/* Close button */}
      {visible && (
        <Pressable
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="Close direction panel"
          accessibilityRole="button"
        >
          <FontAwesome5 name="times" size={30} color={COLORS.concordiaMaroon} />
        </Pressable>
      )}

      {/* Always mounted so the fade-out animation can play */}
      <Animated.View
        style={[styles.container, animatedStyle]}
        pointerEvents={visible && building != null ? "auto" : "none"}
      >
        {building != null && (
          <>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Directions</Text>
            </View>

            {/* Body */}
            <View style={styles.body}>
              <Text style={styles.buildingName}>
                {building.buildingLongName}
              </Text>
              <View style={styles.addressRow}>
                <Pressable
                  style={styles.searchButtonLeftOfAddress}
                  onPress={() => onOpenSearch?.()}
                  disabled={!onOpenSearch}
                  accessibilityLabel="Search buildings to change directions start"
                  accessibilityRole="button"
                >
                  <FontAwesome5
                    name="search"
                    size={14}
                    color={COLORS.concordiaMaroon}
                  />
                </Pressable>
                <Text style={styles.buildingAddress}>{building.address}</Text>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </>
  );
}
