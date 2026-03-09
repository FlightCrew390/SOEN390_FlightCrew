import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Shared slide-down / fade animation for top-anchored panels (SearchPanel, DirectionPanel).
 * Returns `fadeAnim`, `slideAnim`, and a style object ready to spread onto `Animated.View`.
 */
export function usePanelAnimation(visible: boolean) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -40,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  return {
    fadeAnim,
    slideAnim,
    animatedStyle: {
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
    } as const,
  };
}
