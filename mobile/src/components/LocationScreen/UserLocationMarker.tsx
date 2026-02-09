import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Marker } from "react-native-maps";
import Svg, { Circle } from "react-native-svg";

interface UserLocationMarkerProps {
  latitude: number;
  longitude: number;
}

export default function UserLocationMarker({
  latitude,
  longitude,
}: Readonly<UserLocationMarkerProps>) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [pulseAnim, opacityAnim]);

  return (
    <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }}>
      <Animated.View
        style={{
          transform: [{ scale: pulseAnim }],
          opacity: opacityAnim,
        }}
      >
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Circle cx="8" cy="8" r="8" fill="#ff0000" />
          <Circle cx="8" cy="8" r="6" fill="#ffffff" />
          <Circle cx="8" cy="8" r="4" fill="#ff0000" />
        </Svg>
      </Animated.View>
    </Marker>
  );
}
