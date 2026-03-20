import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { SvgUri } from "react-native-svg";
import { API_CONFIG, COLORS } from "../../constants";
import { Building } from "../../types/Building";
import { IndoorRoom } from "../../types/IndoorRoom";

const BUILDING_NAMES: Record<string, string> = {
  Hall: "Henry F. Hall (H) Building",
  CC: "CC Building",
  MB: "John Molson School of Business (MB)",
  VE: "Vanier Extension (VE)",
  VL: "Vanier Library (VL)",
};

const API_BASE_URL = API_CONFIG.getBaseUrl();

const SVG_PLAN_FILES: Record<string, Record<number, string>> = {
  Hall: { 1: "H1.svg", 2: "H2.svg", 8: "hall8.svg", 9: "hall9.svg" },
  CC: { 1: "CC1.svg" },
  VE: { 1: "ve1.svg", 2: "ve2.svg" },
};

const RASTER_PLAN_FILES: Record<string, Record<number, string>> = {
  MB: { 1: "mb_1.png", 2: "mb_s2.png" },
  VL: { 1: "vl_1.png", 2: "vl_2.png" },
};

function getFloorLabel(buildingId: string, floor: number): string {
  if (buildingId === "MB" && floor === 2) return "S2";
  if (buildingId === "MB" && floor === 1) return "1";
  return `${floor}F`;
}

function sortFloorsForDisplay(buildingId: string, floors: number[]): number[] {
  if (buildingId === "MB") {
    return [...floors].sort((a, b) => a - b);
  }
  return [...floors].sort((a, b) => b - a);
}

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

  const svgFileName = SVG_PLAN_FILES[buildingId]?.[floor];
  const rasterFileName = RASTER_PLAN_FILES[buildingId]?.[floor];
  const assetFileName = svgFileName ?? rasterFileName;
  const assetUri = useMemo(
    () =>
      assetFileName
        ? `${API_BASE_URL}/indoor/assets/${encodeURIComponent(assetFileName)}`
        : null,
    [assetFileName],
  );

  const [assetLoadFailed, setAssetLoadFailed] = useState(false);

  useEffect(() => {
    setAssetLoadFailed(false);
  }, [assetUri]);

  const content = assetLoadFailed ? (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#888", fontSize: 15, textAlign: "center" }}>
        Floor plan failed to load.
      </Text>
    </View>
  ) : svgFileName && assetUri ? (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <SvgUri
        uri={assetUri}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        onError={() => setAssetLoadFailed(true)}
      />
    </View>
  ) : rasterFileName && assetUri ? (
    <View
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <Image
        source={{ uri: assetUri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode="contain"
        onError={() => setAssetLoadFailed(true)}
      />
    </View>
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
      <Animated.View style={{ flex: 1, overflow: "hidden" }}>
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
              Indoor view · Floor {getFloorLabel(buildingId, currentFloor)}
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
                {sortFloorsForDisplay(buildingId, floors).map((floor) => (
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
                      {getFloorLabel(buildingId, floor)}
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
