import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useMemo, useReducer } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import { API_CONFIG, COLORS } from "../../constants";
import {
  floorPlanAssetReducer,
  floorSelectorReducer,
  initialFloorPlanAssetState,
  initialFloorSelectorState,
} from "../../reducers/indoorFloorViewReducer";
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
  selectedRoom,
}: Readonly<{
  buildingId: string;
  floor: number;
  selectedRoom?: IndoorRoom | null;
}>) {
  const scale = useSharedValue(INITIAL_SCALE);
  const savedScale = useSharedValue(INITIAL_SCALE);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((e) => {
      scale.value = Math.max(
        INITIAL_SCALE,
        Math.min(savedScale.value * e.scale, 6),
      );
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

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

  const [{ assetLoadFailed }, dispatchFloorPlanAsset] = useReducer(
    floorPlanAssetReducer,
    initialFloorPlanAssetState,
  );

  useEffect(() => {
    dispatchFloorPlanAsset({ type: "RESET" });
  }, [assetUri]);

  const getCoordSpace = (bId: string) => {
    if (bId === "CC") return { width: 8192, height: 2048 };
    if (bId === "Hall" || bId === "VE") return { width: 2048, height: 2048 };
    return { width: 1024, height: 1024 };
  };

  const coordSpace = getCoordSpace(buildingId);
  const mapAspectRatio = coordSpace.width / coordSpace.height;

  const renderPin = () => {
    if (selectedRoom?.floor !== floor) return null;
    return (
      <View
        style={{
          position: "absolute",
          left: `${(selectedRoom.x / coordSpace.width) * 100}%`,
          top: `${(selectedRoom.y / coordSpace.height) * 100}%`,
          transform: [{ translateX: -16 }, { translateY: -32 }],
        }}
      >
        <MaterialCommunityIcons
          name="map-marker"
          size={32}
          color={COLORS.concordiaYellow}
        />
      </View>
    );
  };

  const renderContent = () => {
    if (assetLoadFailed) {
      return (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "#888", fontSize: 15, textAlign: "center" }}>
            Floor plan failed to load.
          </Text>
        </View>
      );
    }

    const fullStyle = {
      flex: 1,
      width: "100%" as const,
      height: "100%" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      overflow: "hidden" as const,
    };

    if (svgFileName && assetUri) {
      return (
        <View style={fullStyle}>
          <View style={{ width: "100%", aspectRatio: mapAspectRatio }}>
            <SvgUri
              uri={assetUri}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              onError={() => dispatchFloorPlanAsset({ type: "LOAD_FAILED" })}
            />
            {renderPin()}
          </View>
        </View>
      );
    }

    if (rasterFileName && assetUri) {
      return (
        <View style={fullStyle}>
          <View style={{ width: "100%", aspectRatio: mapAspectRatio }}>
            <Image
              source={{ uri: assetUri }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
              onError={() => dispatchFloorPlanAsset({ type: "LOAD_FAILED" })}
            />
            {renderPin()}
          </View>
        </View>
      );
    }

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#888", fontSize: 15 }}>
          No floor plan available.
        </Text>
      </View>
    );
  };

  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={[{ flex: 1, overflow: "hidden" }]}>
        <Animated.View style={animatedStyle}>{renderContent()}</Animated.View>
      </Animated.View>
    </GestureDetector>
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
  readonly selectedRoom?: IndoorRoom | null;
}

export default function IndoorFloorView({
  building,
  buildingId,
  floors,
  currentFloor,
  onFloorChange,
  onBack,
  selectedRoom,
}: Readonly<IndoorFloorViewProps>) {
  const [{ floorOpen }, dispatchFloorSelector] = useReducer(
    floorSelectorReducer,
    initialFloorSelectorState,
  );

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
              {selectedRoom?.floor === currentFloor
                ? ` · ${selectedRoom.label}`
                : ""}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <View style={{ flex: 1 }}>
        <ZoomableFloorPlan
          buildingId={buildingId}
          floor={currentFloor}
          selectedRoom={selectedRoom}
        />

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
            onPress={() => dispatchFloorSelector({ type: "TOGGLE" })}
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
                      dispatchFloorSelector({ type: "CLOSE" });
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
