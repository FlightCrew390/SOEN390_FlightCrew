import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from "react-native-gesture-handler";
import { COLORS } from "../../constants";
import { Building } from "../../types/Building";
import { IndoorRoom } from "../../types/IndoorRoom";

import CC1 from "../../../floor_plans_2/CC1.svg";
import H1 from "../../../floor_plans_2/H1.svg";
import H2 from "../../../floor_plans_2/H2.svg";
import Hall8 from "../../../floor_plans_2/hall8.svg";
import Hall9 from "../../../floor_plans_2/hall9.svg";
import VE1 from "../../../floor_plans_2/ve1.svg";
import VE2 from "../../../floor_plans_2/ve2.svg";

const BUILDING_NAMES: Record<string, string> = {
  Hall: "Henry F. Hall (H) Building",
  CC: "CC Building",
  MB: "John Molson School of Business (MB)",
  VE: "Vanier Extension (VE)",
  VL: "Vanier Library (VL)",
};

type SvgComponent = React.FC<{
  width: string | number;
  height: string | number;
}>;

const SVG_PLANS: Record<string, Record<number, SvgComponent>> = {
  Hall: { 1: H1, 2: H2, 8: Hall8, 9: Hall9 },
  CC: { 1: CC1 },
  VE: { 1: VE1, 2: VE2 },
};

const PNG_PLANS: Record<string, Record<number, number>> = {
  MB: {
    1: require("../../../floor_plans_2/mb_1.png"),
    2: require("../../../floor_plans_2/mb_s2.png"),
  },
  VL: {
    1: require("../../../floor_plans_2/vl_1.png"),
    2: require("../../../floor_plans_2/vl_2.png"),
  },
};

const INITIAL_SCALE = 0.82;

function ZoomableFloorPlan({
  buildingId,
  floor,
}: {
  buildingId: string;
  floor: number;
}) {
  const baseScale = useRef(new Animated.Value(INITIAL_SCALE)).current;
  const pinchScale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(INITIAL_SCALE);

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef({ x: 0, y: 0 });

  const pinchRef = useRef(null);
  const panRef = useRef(null);

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale: pinchScale } }],
    { useNativeDriver: true },
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const next = Math.max(
        INITIAL_SCALE,
        Math.min(lastScale.current * event.nativeEvent.scale, 6),
      );
      lastScale.current = next;
      baseScale.setValue(next);
      pinchScale.setValue(1);
    }
  };

  const onPanEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true },
  );

  const onPanStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      lastOffset.current.x += event.nativeEvent.translationX;
      lastOffset.current.y += event.nativeEvent.translationY;
      translateX.setOffset(lastOffset.current.x);
      translateX.setValue(0);
      translateY.setOffset(lastOffset.current.y);
      translateY.setValue(0);
    }
  };

  const combinedScale = Animated.multiply(baseScale, pinchScale);

  const SvgPlan = SVG_PLANS[buildingId]?.[floor];
  const pngSource = PNG_PLANS[buildingId]?.[floor];

  const content = SvgPlan ? (
    <SvgPlan width="100%" height="100%" />
  ) : pngSource ? (
    <Image
      source={pngSource}
      style={{ flex: 1, width: "100%" }}
      resizeMode="contain"
    />
  ) : (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#888", fontSize: 15 }}>
        No floor plan available.
      </Text>
    </View>
  );

  return (
    <PanGestureHandler
      ref={panRef}
      simultaneousHandlers={pinchRef}
      onGestureEvent={onPanEvent}
      onHandlerStateChange={onPanStateChange}
    >
      <Animated.View style={{ flex: 1 }}>
        <PinchGestureHandler
          ref={pinchRef}
          simultaneousHandlers={panRef}
          onGestureEvent={onPinchEvent}
          onHandlerStateChange={onPinchStateChange}
        >
          <Animated.View
            style={{
              flex: 1,
              transform: [
                { translateX },
                { translateY },
                { scale: combinedScale },
              ],
            }}
          >
            {content}
          </Animated.View>
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}

interface IndoorFloorViewProps {
  readonly building: Building;
  readonly buildingId: string;
  readonly floors: number[];
  readonly currentFloor: number;
  readonly onFloorChange: (floor: number) => void;
  readonly onBack: () => void;
  readonly onRoomPress: (room: IndoorRoom) => void;
}

export default function IndoorFloorView({
  building,
  buildingId,
  floors,
  currentFloor,
  onFloorChange,
  onBack,
}: Readonly<IndoorFloorViewProps>) {
  const [floorOpen, setFloorOpen] = React.useState(false);

  const buildingLabel =
    building.buildingName ?? BUILDING_NAMES[buildingId] ?? buildingId;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#f0f0f0",
        zIndex: 20,
      }}
    >
      <SafeAreaView style={{ backgroundColor: "#e2e2e2" }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Pressable
            onPress={onBack}
            style={{ padding: 4, width: 36 }}
            accessibilityLabel="Back to building info"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={COLORS.concordiaMaroon}
            />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center", marginTop: 6 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: "#222",
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {buildingLabel}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
                marginTop: 2,
                textAlign: "center",
              }}
            >
              Indoor view · Floor {currentFloor}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={{ flex: 1 }}>
        <ZoomableFloorPlan buildingId={buildingId} floor={currentFloor} />

        {/* Floor selector */}
        <View
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <Pressable
            onPress={() => setFloorOpen((v) => !v)}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4,
            }}
            accessibilityLabel="Select floor"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="layers"
              size={30}
              color={COLORS.concordiaMaroon}
            />
          </Pressable>

          {floorOpen && (
            <View
              style={{
                marginTop: 8,
                backgroundColor: "#fff",
                borderRadius: 14,
                overflow: "hidden",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 6,
                maxHeight: Math.min(7, floors.length) * 60,
              }}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {[...floors]
                  .sort((a, b) => b - a)
                  .map((floor) => (
                    <Pressable
                      key={floor}
                      onPress={() => {
                        onFloorChange(floor);
                        setFloorOpen(false);
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          floor === currentFloor
                            ? COLORS.concordiaMaroon
                            : "transparent",
                      }}
                      accessibilityLabel={`Floor ${floor}`}
                      accessibilityRole="button"
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: floor === currentFloor ? "#fff" : "#333",
                        }}
                      >
                        {floor}F
                      </Text>
                    </Pressable>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Outdoor toggle */}
        <Pressable
          onPress={onBack}
          style={{
            position: "absolute",
            bottom: 24,
            right: 12,
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: "#fff",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 4,
          }}
          accessibilityLabel="Switch to outdoor map"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="map"
            size={24}
            color={COLORS.concordiaMaroon}
          />
        </Pressable>
      </View>
    </View>
  );
}
