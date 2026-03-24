import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useReducer, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Gesture,
  GestureDetector,
  TouchableOpacity as GHTouchableOpacity,
} from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { SvgUri, Polyline, Path } from "react-native-svg";
import { API_CONFIG, COLORS } from "../../constants";
import {
  floorPlanAssetReducer,
  floorSelectorReducer,
  initialFloorPlanAssetState,
  initialFloorSelectorState,
} from "../../reducers/indoorFloorViewReducer";
import { getIndoorPoisForBuilding } from "../../services/IndoorPoiService";
import { Building } from "../../types/Building";
import { IndoorPoiCategory } from "../../types/IndoorPointOfInterest";
import { IndoorRoom } from "../../types/IndoorRoom";
import { RouteInfo } from "../../types/Directions";
import { getManeuverIcon } from "../../utils/directionsUtils";
import { formatDistance } from "../../utils/formatHelper";
import StepsPanel from "./StepsPanel";

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

export function getFloorLabel(buildingId: string, floor: number): string {
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

/** Maps the buildingId used in IndoorFloorView to the buildingCode used in indoorPOIs */
const BUILDING_ID_TO_POI_CODE: Record<string, string> = {
  Hall: "H",
  CC: "CC",
  MB: "MB",
};

const AMENITY_ICON: Record<
  IndoorPoiCategory,
  "human-male-female" | "water" | "stairs" | "elevator"
> = {
  washroom: "human-male-female",
  fountain: "water",
  stairs: "stairs",
  elevator: "elevator",
};

function getViewBoxInfo(bId: string, floor: number) {
  if (bId === "CC") return { minX: 0, minY: 0, width: 4096, height: 1024 };
  if (bId === "Hall") {
    if (floor === 8)
      return { minX: -60, minY: -260, width: 1180, height: 1340 };
    if (floor === 9) return { minX: -40, minY: -40, width: 1120, height: 1120 };
  }
  return { minX: 0, minY: 0, width: 1024, height: 1024 };
}

function getMappedPoint(bId: string, px: number, py: number) {
  if (bId === "Hall" || bId === "CC" || bId === "VE") {
    return { x: px * 0.5, y: py * 0.5 };
  }
  return { x: px, y: py };
}

/** Shared base style for all icon pins overlaid on the floor plan. */
const PIN_BASE_STYLE = {
  position: "absolute" as const,
  transform: [{ translateX: -12 }, { translateY: -12 }],
  borderRadius: 12,
  padding: 4,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.3,
  shadowRadius: 2,
  elevation: 3,
};

function CustomAmenitySelectorIcon({
  size = 30,
  color = COLORS.concordiaMaroon,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 4L15.5 7.5L12 11L8.5 7.5Z" fill={color} />
      <Path d="M12 13L15.5 16.5L12 20L8.5 16.5Z" fill={color} />
      <Path d="M7.5 8.5L11 12L7.5 15.5L4 12Z" fill={color} />
      <Path d="M16.5 8.5L20 12L16.5 15.5L13 12Z" fill={color} />
    </Svg>
  );
}

function ZoomableFloorPlan({
  buildingId,
  floor,
  selectedRoom,
  route,
  selectedAmenities,
  onFloorChange,
}: Readonly<{
  buildingId: string;
  floor: number;
  selectedRoom?: IndoorRoom | null;
  route?: RouteInfo | null;
  selectedAmenities: Set<IndoorPoiCategory>;
  onFloorChange: (floor: number) => void;
}>) {
  const activeIndoorPath = useMemo(() => {
    if (!route) return null;
    if (
      route.indoorPathOrigin?.length &&
      route.indoorPathOrigin[0].buildingId === buildingId
    ) {
      return route.indoorPathOrigin;
    }
    if (
      route.indoorPath?.length &&
      route.indoorPath[0].buildingId === buildingId
    ) {
      return route.indoorPath;
    }
    return null;
  }, [route, buildingId]);

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

  const viewBoxInfo = useMemo(
    () => getViewBoxInfo(buildingId, floor),
    [buildingId, floor],
  );
  const mapAspectRatio = viewBoxInfo.width / viewBoxInfo.height;
  const viewBoxStr = `${viewBoxInfo.minX} ${viewBoxInfo.minY} ${viewBoxInfo.width} ${viewBoxInfo.height}`;

  const renderPin = () => {
    if (selectedRoom?.floor !== floor) return null;
    const mapped = getMappedPoint(buildingId, selectedRoom.x, selectedRoom.y);
    return (
      <View
        style={{
          position: "absolute",
          left: `${((mapped.x - viewBoxInfo.minX) / viewBoxInfo.width) * 100}%`,
          top: `${((mapped.y - viewBoxInfo.minY) / viewBoxInfo.height) * 100}%`,
          transform: [{ translateX: -16 }, { translateY: -32 }],
        }}
      >
        <MaterialCommunityIcons name="map-marker" size={32} color="#1b73e8" />
      </View>
    );
  };

  const renderEntryExitPins = () => {
    if (
      !route ||
      !activeIndoorPath ||
      !route.coordinates ||
      route.coordinates.length === 0
    )
      return null;
    const pins = [];
    const first = activeIndoorPath[0];
    const last = activeIndoorPath.at(-1)!;

    if (first.floor === floor && first.id.includes("entry_exit")) {
      pins.push(first);
    }
    if (
      last !== first &&
      last.floor === floor &&
      last.id.includes("entry_exit")
    ) {
      pins.push(last);
    }

    return pins.map((node) => {
      const mapped = getMappedPoint(buildingId, node.x, node.y);
      return (
        <View
          key={`entry-exit-pin-${node.id}`}
          style={{
            ...PIN_BASE_STYLE,
            left: `${((mapped.x - viewBoxInfo.minX) / viewBoxInfo.width) * 100}%`,
            top: `${((mapped.y - viewBoxInfo.minY) / viewBoxInfo.height) * 100}%`,
            backgroundColor: "#4caf50",
            zIndex: 41,
          }}
        >
          <MaterialCommunityIcons name="door-open" size={16} color="white" />
        </View>
      );
    });
  };

  const renderTransitionPins = () => {
    if (!route || !activeIndoorPath) return null;
    const transitionPins = [];

    for (let i = 0; i < activeIndoorPath.length - 1; i++) {
      const current = activeIndoorPath[i];
      const next = activeIndoorPath[i + 1];

      if (current.floor === floor && next.floor !== floor) {
        transitionPins.push({ node: current, type: "next" });
      } else if (current.floor !== floor && next.floor === floor) {
        transitionPins.push({ node: next, type: "prev" });
      }
    }

    return transitionPins.map((t) => {
      const mapped = getMappedPoint(buildingId, t.node.x, t.node.y);
      return (
        <View
          key={`transition-pin-${t.node.id}`}
          style={{
            ...PIN_BASE_STYLE,
            left: `${((mapped.x - viewBoxInfo.minX) / viewBoxInfo.width) * 100}%`,
            top: `${((mapped.y - viewBoxInfo.minY) / viewBoxInfo.height) * 100}%`,
            backgroundColor: COLORS.concordiaMaroon,
            zIndex: 40,
          }}
        >
          <MaterialCommunityIcons
            name={t.type === "next" ? "elevator-up" : "elevator-down"}
            size={16}
            color="white"
          />
        </View>
      );
    });
  };

  const indoorPois = useMemo(() => {
    const code = BUILDING_ID_TO_POI_CODE[buildingId];
    if (!code) return [];
    return getIndoorPoisForBuilding(code).filter(
      (poi) =>
        poi.floor === floor &&
        poi.x != null &&
        poi.y != null &&
        selectedAmenities.has(poi.category),
    );
  }, [buildingId, floor, selectedAmenities]);

  const renderIndoorPois = () =>
    indoorPois.map((poi) => {
      const mapped = getMappedPoint(buildingId, poi.x!, poi.y!);
      const iconName = AMENITY_ICON[poi.category] ?? "map-marker";
      return (
        <View
          key={poi.id}
          style={{
            ...PIN_BASE_STYLE,
            left: `${((mapped.x - viewBoxInfo.minX) / viewBoxInfo.width) * 100}%`,
            top: `${((mapped.y - viewBoxInfo.minY) / viewBoxInfo.height) * 100}%`,
            backgroundColor: COLORS.concordiaMaroon,
            zIndex: 35,
          }}
        >
          <GHTouchableOpacity
            testID={`indoor-poi-pin-${poi.id}`}
            accessibilityLabel={poi.name}
            accessibilityRole="button"
            onPress={() => {
              Alert.alert(poi.name, poi.description);
            }}
          >
            <MaterialCommunityIcons name={iconName} size={16} color="white" />
          </GHTouchableOpacity>
        </View>
      );
    });

  const renderPath = () => {
    if (!route || !activeIndoorPath) return null;

    // Filter the nodes that are on the current floor
    const pointsStr = activeIndoorPath
      .filter((node) => node.floor === floor)
      .map((node) => {
        const mapped = getMappedPoint(buildingId, node.x, node.y);
        return `${mapped.x},${mapped.y}`;
      })
      .join(" ");

    if (!pointsStr) return null;

    return (
      <View
        style={{ position: "absolute", width: "100%", height: "100%" }}
        pointerEvents="none"
      >
        <Svg width="100%" height="100%" viewBox={viewBoxStr}>
          <Polyline
            points={pointsStr}
            fill="none"
            stroke="#1b73e8"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
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
            {renderPath()}
            {renderIndoorPois()}
            {renderTransitionPins()}
            {renderEntryExitPins()}
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
            {renderPath()}
            {renderIndoorPois()}
            {renderTransitionPins()}
            {renderEntryExitPins()}
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
  readonly route?: RouteInfo | null;
}

export default function IndoorFloorView({
  building,
  buildingId,
  floors,
  currentFloor,
  onFloorChange,
  onBack,
  selectedRoom,
  route,
}: Readonly<IndoorFloorViewProps>) {
  const [stepsExpanded, setStepsExpanded] = useState(false);
  const [amenityOpen, setAmenityOpen] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState<
    Set<IndoorPoiCategory>
  >(new Set(["washroom", "fountain", "stairs", "elevator"]));

  const toggleAmenity = (category: IndoorPoiCategory) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const activeIndoorPath = useMemo(() => {
    if (!route) return null;
    if (
      route.indoorPathOrigin?.length &&
      route.indoorPathOrigin[0].buildingId === buildingId
    ) {
      return route.indoorPathOrigin;
    }
    if (
      route.indoorPath?.length &&
      route.indoorPath[0].buildingId === buildingId
    ) {
      return route.indoorPath;
    }
    return null;
  }, [route, buildingId]);

  const indoorSteps = useMemo(() => {
    if (!route) return [];
    // Pure indoor route (same building, no outdoor component)
    if (!route.coordinates || route.coordinates.length === 0) {
      return route.steps;
    }
    // Mixed route — find indoor steps for this building
    if (
      route.indoorPathOrigin?.length &&
      route.indoorPathOrigin[0].buildingId === buildingId &&
      route.indoorStepsOrigin?.length
    ) {
      return route.indoorStepsOrigin;
    }
    if (
      route.indoorPath?.length &&
      route.indoorPath[0].buildingId === buildingId &&
      route.indoorSteps?.length
    ) {
      return route.indoorSteps;
    }
    return [];
  }, [route, buildingId]);

  const [{ floorOpen }, dispatchFloorSelector] = useReducer(
    floorSelectorReducer,
    initialFloorSelectorState,
  );

  const { nextFloors, prevFloors } = useMemo(() => {
    if (!route || !activeIndoorPath) {
      return { nextFloors: [], prevFloors: [] };
    }

    const nextF: number[] = [];
    const prevF: number[] = [];
    for (let i = 0; i < activeIndoorPath.length - 1; i++) {
      const current = activeIndoorPath[i];
      const next = activeIndoorPath[i + 1];
      if (current.floor === currentFloor && next.floor !== currentFloor) {
        nextF.push(next.floor);
      } else if (
        current.floor !== currentFloor &&
        next.floor === currentFloor
      ) {
        prevF.push(current.floor);
      }
    }
    return {
      nextFloors: Array.from(new Set(nextF)),
      prevFloors: Array.from(new Set(prevF)),
    };
  }, [route, currentFloor, activeIndoorPath]);

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
      <View style={{ flex: 1 }}>
        <ZoomableFloorPlan
          buildingId={buildingId}
          floor={currentFloor}
          selectedRoom={selectedRoom}
          route={route}
          selectedAmenities={selectedAmenities}
          onFloorChange={onFloorChange}
        />

        {/* Top Directions Panel (Using unified StepsPanel) */}
        {indoorSteps.length > 0 && (
          <StepsPanel
            building={building}
            route={{ ...route!, steps: indoorSteps }}
            stepsOverride={indoorSteps}
            departureConfig={{ option: "now", date: new Date() }}
            onBack={onBack}
            isIndoor={true}
            destinationRoom={
              selectedRoom?.floor === currentFloor ? selectedRoom : null
            }
          />
        )}

        {/* Standard Header (only shown if not navigating) */}
        {indoorSteps.length === 0 && (
          <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
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
                    Indoor view · Floor{" "}
                    {getFloorLabel(buildingId, currentFloor)}
                    {selectedRoom?.floor === currentFloor
                      ? ` · ${selectedRoom.label}`
                      : ""}
                  </Text>
                </View>
                <View style={{ width: 36 }} />
              </View>
            </SafeAreaView>
          </View>
        )}

        {/* Floor selector (Moved to Left) */}
        <View
          style={{
            position: "absolute",
            top: indoorSteps.length > 0 ? "52%" : 112,
            left: 12,
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

        {/* Amenity selector (New, on Right) */}
        <View
          style={{
            position: "absolute",
            top: indoorSteps.length > 0 ? 100 : 112,
            right: 12,
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <Pressable
            onPress={() => setAmenityOpen(!amenityOpen)}
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
            accessibilityLabel="Filter amenities"
            accessibilityRole="button"
          >
            <CustomAmenitySelectorIcon size={38} />
          </Pressable>

          {amenityOpen && (
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
              }}
            >
              {(
                [
                  "washroom",
                  "fountain",
                  "stairs",
                  "elevator",
                ] as IndoorPoiCategory[]
              ).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => toggleAmenity(cat)}
                  style={{
                    width: 60,
                    height: 60,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: selectedAmenities.has(cat)
                      ? COLORS.concordiaMaroon
                      : "transparent",
                  }}
                  accessibilityLabel={`Toggle ${cat}`}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name={AMENITY_ICON[cat]}
                    size={24}
                    color={selectedAmenities.has(cat) ? "#fff" : "#333"}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Floor Transitions */}
        {(nextFloors.length > 0 || prevFloors.length > 0) && (
          <View
            style={{
              position: "absolute",
              bottom: 60,
              alignSelf: "center",
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 10,
              zIndex: 40,
              paddingHorizontal: 20,
            }}
          >
            {prevFloors.map((tFloor) => (
              <Pressable
                key={`prev-${tFloor}`}
                onPress={() => onFloorChange(tFloor)}
                style={{
                  backgroundColor: "#fff",
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderRadius: 25,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                  borderWidth: 1,
                  borderColor: COLORS.concordiaMaroon,
                }}
              >
                <Text
                  style={{
                    color: COLORS.concordiaMaroon,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Back to Floor {getFloorLabel(buildingId, tFloor)}
                </Text>
              </Pressable>
            ))}
            {nextFloors.map((tFloor) => (
              <Pressable
                key={`next-${tFloor}`}
                onPress={() => onFloorChange(tFloor)}
                style={{
                  backgroundColor: COLORS.concordiaMaroon,
                  paddingHorizontal: 20,
                  paddingVertical: 14,
                  borderRadius: 25,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "bold", fontSize: 16 }}
                >
                  Continue to Floor {getFloorLabel(buildingId, tFloor)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Outdoor toggle */}
        {!route && (
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
        )}
      </View>
    </View>
  );
}
