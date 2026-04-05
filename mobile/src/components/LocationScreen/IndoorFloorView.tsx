import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Polyline, SvgUri } from "react-native-svg";
import { API_CONFIG, COLORS } from "../../constants";
import {
  ALL_AMENITY_CATEGORIES,
  PRIMARY_AMENITY_CATEGORIES,
} from "../../constants/indoorPoi";
import {
  amenitySelectorReducer,
  floorPlanAssetReducer,
  floorSelectorReducer,
  initialAmenitySelectorState,
  initialFloorPlanAssetState,
  initialFloorSelectorState,
} from "../../reducers/indoorFloorViewReducer";
import indoorFloorViewStyles from "../../styles/IndoorFloorView";
import { getIndoorPoisForBuilding } from "../../services/IndoorPoiService";
import { Building } from "../../types/Building";
import { RouteInfo } from "../../types/Directions";
import {
  IndoorPoiCategory,
  IndoorPointOfInterest,
} from "../../types/IndoorPointOfInterest";
import { IndoorRoom } from "../../types/IndoorRoom";
import { getFloorLabel } from "../../utils/indoorFloorUtils";
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
  readonly size?: number;
  readonly color?: string;
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
  indoorPois,
  onFloorChange,
}: Readonly<{
  buildingId: string;
  floor: number;
  selectedRoom?: IndoorRoom | null;
  route?: RouteInfo | null;
  selectedAmenities: Set<IndoorPoiCategory>;
  indoorPois: IndoorPointOfInterest[];
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
      const isStair =
        (t.node as any).type === "stair_landing" ||
        t.node.id.toLowerCase().includes("stair");

      const elevatorIcon = t.type === "next" ? "elevator-up" : "elevator-down";
      const iconName = isStair ? "stairs" : elevatorIcon;

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
          <MaterialCommunityIcons name={iconName} size={16} color="white" />
        </View>
      );
    });
  };

  const filteredIndoorPois = useMemo(() => {
    return indoorPois.filter(
      (poi) =>
        poi.floor === floor &&
        poi.x != null &&
        poi.y != null &&
        selectedAmenities.has(poi.category),
    );
  }, [indoorPois, floor, selectedAmenities]);

  const renderIndoorPois = () =>
    filteredIndoorPois.map((poi) => {
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
          <TouchableOpacity
            testID={`indoor-poi-pin-${poi.id}`}
            accessibilityLabel={poi.name}
            accessibilityRole="button"
            onPress={() => {
              Alert.alert(poi.name, poi.description);
            }}
          >
            <MaterialCommunityIcons name={iconName} size={16} color="white" />
          </TouchableOpacity>
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
  readonly hideSteps?: boolean;
  readonly activeStepIndex?: number;
  readonly onStepPress?: (index: number) => void;
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
  hideSteps = false,
  activeStepIndex = -1,
  onStepPress,
}: Readonly<IndoorFloorViewProps>) {
  const [{ amenityOpen, amenityPanelExpanded }, dispatchAmenitySelector] =
    useReducer(amenitySelectorReducer, initialAmenitySelectorState);
  const [selectedAmenities, setSelectedAmenities] = useState<
    Set<IndoorPoiCategory>
  >(new Set(["washroom", "fountain", "stairs", "elevator"]));
  const [indoorPois, setIndoorPois] = useState<IndoorPointOfInterest[]>([]);

  // Fetch indoor POIs when building or amenities change
  useEffect(() => {
    const fetchPois = async () => {
      const code = BUILDING_ID_TO_POI_CODE[buildingId];
      if (!code) {
        setIndoorPois([]);
        return;
      }

      try {
        const pois = await getIndoorPoisForBuilding(code);
        setIndoorPois(pois);
      } catch (error) {
        console.error("Failed to fetch indoor POIs:", error);
        setIndoorPois([]);
      }
    };

    fetchPois();
  }, [buildingId]);

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

  // Sync initial floor to start of route if needed
  useEffect(() => {
    if (activeIndoorPath && activeIndoorPath.length > 0) {
      const startFloor = activeIndoorPath[0].floor;
      if (startFloor !== currentFloor) {
        onFloorChange(startFloor);
      }
    }
    // Only run once when route/path is first available for this building
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!activeIndoorPath]);

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

  const buildingLabel =
    building.buildingName ?? BUILDING_NAMES[buildingId] ?? buildingId;

  return (
    <View style={indoorFloorViewStyles.container}>
      <View style={indoorFloorViewStyles.flexWrapper}>
        <ZoomableFloorPlan
          buildingId={buildingId}
          floor={currentFloor}
          selectedRoom={selectedRoom}
          route={route}
          selectedAmenities={selectedAmenities}
          indoorPois={indoorPois}
          onFloorChange={onFloorChange}
        />

        {/* Top Directions Panel (Using unified StepsPanel) */}
        {indoorSteps.length > 0 && !hideSteps && (
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
            activeStepIndex={activeStepIndex}
            onStepPress={onStepPress}
          />
        )}

        {/* Standard Header (only shown if not navigating) */}
        {indoorSteps.length === 0 && (
          <View style={indoorFloorViewStyles.headerContainer}>
            <SafeAreaView style={indoorFloorViewStyles.safeAreaHeader}>
              <View style={indoorFloorViewStyles.headerRow}>
                <Pressable
                  onPress={onBack}
                  style={indoorFloorViewStyles.backButton}
                  accessibilityLabel="Back to building info"
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name="chevron-left"
                    size={28}
                    color={COLORS.concordiaMaroon}
                  />
                </Pressable>
                <View style={indoorFloorViewStyles.headerTitleWrapper}>
                  <Text
                    style={indoorFloorViewStyles.headerTitle}
                    numberOfLines={1}
                  >
                    {buildingLabel}
                  </Text>
                  <Text style={indoorFloorViewStyles.headerSubtitle}>
                    Indoor view · Floor{" "}
                    {getFloorLabel(buildingId, currentFloor)}
                    {selectedRoom?.floor === currentFloor
                      ? ` · ${selectedRoom.label}`
                      : ""}
                  </Text>
                </View>
                <View style={indoorFloorViewStyles.headerSpacer} />
              </View>
            </SafeAreaView>
          </View>
        )}

        {/* Floor selector (Moved to Left) */}
        <View
          style={{
            position: "absolute",
            top: indoorSteps.length > 0 ? "52%" : 180,
            left: 12,
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <Pressable
            onPress={() => dispatchFloorSelector({ type: "TOGGLE" })}
            style={indoorFloorViewStyles.floatButton}
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
              style={[
                indoorFloorViewStyles.floorSelectorDropdown,
                { maxHeight: Math.min(7, floors.length) * 60 },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                {sortFloorsForDisplay(buildingId, floors).map((floor) => (
                  <Pressable
                    key={floor}
                    onPress={() => {
                      onFloorChange(floor);
                      dispatchFloorSelector({ type: "CLOSE" });
                    }}
                    style={[
                      indoorFloorViewStyles.floorOption,
                      floor === currentFloor
                        ? indoorFloorViewStyles.selectedOption
                        : indoorFloorViewStyles.unselectedOption,
                    ]}
                    accessibilityLabel={`Floor ${floor}`}
                    accessibilityRole="button"
                  >
                    <Text
                      style={[
                        indoorFloorViewStyles.floorOptionText,
                        { color: floor === currentFloor ? "#fff" : "#333" },
                      ]}
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
            top: indoorSteps.length > 0 ? 100 : 180,
            right: 12,
            alignItems: "center",
            zIndex: 30,
          }}
        >
          <Pressable
            onPress={() => dispatchAmenitySelector({ type: "TOGGLE_OPEN" })}
            style={indoorFloorViewStyles.floatButton}
            accessibilityLabel="Filter amenities"
            accessibilityRole="button"
          >
            <CustomAmenitySelectorIcon size={38} />
          </Pressable>

          {amenityOpen && (
            <View style={indoorFloorViewStyles.amenityDropdown}>
              {(amenityPanelExpanded
                ? ALL_AMENITY_CATEGORIES
                : PRIMARY_AMENITY_CATEGORIES
              ).map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => toggleAmenity(cat)}
                  style={[
                    indoorFloorViewStyles.amenityOption,
                    selectedAmenities.has(cat)
                      ? indoorFloorViewStyles.selectedOption
                      : indoorFloorViewStyles.unselectedOption,
                  ]}
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
              <Pressable
                onPress={() =>
                  dispatchAmenitySelector({ type: "TOGGLE_EXPANDED" })
                }
                style={indoorFloorViewStyles.amenityExpandToggle}
                accessibilityLabel={
                  amenityPanelExpanded
                    ? "Show fewer amenities"
                    : "Show more amenities"
                }
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={amenityPanelExpanded ? "chevron-up" : "chevron-down"}
                  size={20}
                  color="#888"
                />
              </Pressable>
            </View>
          )}
        </View>

        {/* Outdoor toggle */}
        {!route && (
          <Pressable
            onPress={onBack}
            style={indoorFloorViewStyles.outdoorToggleButton}
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
