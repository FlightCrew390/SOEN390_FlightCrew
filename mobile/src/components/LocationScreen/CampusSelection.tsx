import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  Text,
  View,
} from "react-native";
import { CAMPUSES, CampusId } from "../../constants/campuses";
import styles from "../../styles/CampusSelection";

interface CampusSelectionProps {
  activeCampusId: CampusId;
  onCampusChange: (campus: CampusId) => void;
}

const campusOptions: CampusId[] = ["SGW", "LOYOLA"];
const TOGGLE_PADDING = 6;
const ACTIVE_LABEL_COLOR = "#8b2020";
const INACTIVE_LABEL_COLOR = "rgba(255, 255, 255, 0.88)";

export default function CampusSelection({
  activeCampusId,
  onCampusChange,
}: Readonly<CampusSelectionProps>) {
  const selectedIndex = campusOptions.indexOf(activeCampusId);
  const [containerWidth, setContainerWidth] = useState(0);
  const sliderPosition = useRef(new Animated.Value(selectedIndex)).current;

  useEffect(() => {
    Animated.timing(sliderPosition, {
      toValue: selectedIndex,
      duration: 220,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [selectedIndex, sliderPosition]);

  const indicatorWidth = Math.max(
    (containerWidth - TOGGLE_PADDING * 2) / campusOptions.length,
    0,
  );

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoBadge}>
        <Text style={styles.infoText}>Campus</Text>
      </View>
      <View
        style={styles.toggleContainer}
        accessibilityRole="tablist"
        onLayout={handleContainerLayout}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            {
              width: indicatorWidth,
              transform: [
                {
                  translateX: sliderPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, indicatorWidth],
                  }),
                },
              ],
            },
          ]}
        />
        {campusOptions.map((campusId, index) => {
          const isActive = campusId === activeCampusId;
          const label = campusId === "LOYOLA" ? "Loyola" : campusId;
          const animatedLabelColor = sliderPosition.interpolate({
            inputRange: [0, 1],
            outputRange:
              index === 0
                ? [ACTIVE_LABEL_COLOR, INACTIVE_LABEL_COLOR]
                : [INACTIVE_LABEL_COLOR, ACTIVE_LABEL_COLOR],
          });

          return (
            <Pressable
              key={campusId}
              onPress={() => onCampusChange(campusId)}
              style={styles.toggleOption}
              testID={
                isActive
                  ? `campus-selector-${campusId.toLowerCase()}-active`
                  : undefined
              }
              accessibilityRole="button"
              accessibilityLabel={`${CAMPUSES[campusId].name} selector`}
              accessibilityState={{ selected: isActive }}
            >
              <Animated.Text
                style={[styles.toggleLabel, { color: animatedLabelColor }]}
              >
                {label}
              </Animated.Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
