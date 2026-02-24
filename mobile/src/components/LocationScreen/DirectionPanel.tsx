import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../constants";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import styles from "../../styles/DirectionPanel";
import { Building } from "../../types/Building";

const ICONS = {
  walk: require("../../../assets/walk.png"),
  bike: require("../../../assets/bike.png"),
  train: require("../../../assets/train.png"),
  car: require("../../../assets/car.png"),
} as const;

interface DirectionPanelProps {
  readonly visible: boolean;
  readonly building: Building | null;
  readonly onClose: () => void;
}

function TransportCard({
  icon,
}: Readonly<{ icon: ReturnType<typeof require> }>) {
  return (
    <View style={styles.transportCard}>
      <Image source={icon} style={styles.transportIcon} resizeMode="contain" />
      <Text style={styles.transportTime}>-- min</Text>
    </View>
  );
}

export default function DirectionPanel({
  visible,
  building,
  onClose,
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

            <View style={styles.buildingInfoRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.buildingName} numberOfLines={1}>
                  {building.buildingName ?? building.buildingCode}
                </Text>
                <Text style={styles.buildingAddress} numberOfLines={2}>
                  {building.address ?? ""}
                </Text>
              </View>
              <Text style={styles.distanceText}>-- m</Text>
            </View>

            {/* Transport options */}
            <View style={styles.transportRow}>
              <TransportCard icon={ICONS.walk} />
              <TransportCard icon={ICONS.bike} />
              <TransportCard icon={ICONS.train} />
              <TransportCard icon={ICONS.car} />
            </View>

            <View style={styles.divider} />

            {/* Building details */}
            <ScrollView
              style={styles.descriptionScroll}
              showsVerticalScrollIndicator
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.buildingLongName}>
                {building.buildingLongName}
              </Text>
              <Text style={styles.buildingDetail}>
                Building Code: {building.buildingCode}
              </Text>
              <Text style={styles.buildingDetail}>
                Campus:{" "}
                {building.campus === "SGW" ? "Sir George Williams" : "Loyola"}
              </Text>
            </ScrollView>
          </>
        )}
      </Animated.View>
    </>
  );
}
