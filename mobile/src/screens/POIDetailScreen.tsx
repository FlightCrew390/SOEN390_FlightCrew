import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { RootStackParamList } from "../types/NavBar";
import { Building } from "../types/Building";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { useBuildingData } from "../hooks/useBuildingData";
import {
  calculateDistance,
  findCurrentBuilding,
} from "../utils/buildingDetection";
import { decodePolyline } from "../utils/decodePolyline";
import {
  fetchDirections,
  travelModeFromShort,
  type DirectionStep,
} from "../services/DirectionsService";
import { COLORS } from "../constants";
import styles from "../styles/POIDetailScreen";

type POIDetailRouteProp = RouteProp<RootStackParamList, "POIDetail">;

export default function POIDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<POIDetailRouteProp>();
  const { location } = useCurrentLocation();
  const { buildings } = useBuildingData();
  const building = route.params.building;

  const currentBuilding = useMemo(() => {
    if (!location || buildings.length === 0) return null;
    return findCurrentBuilding(
      {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      buildings,
    );
  }, [location, buildings]);

  const [originBuilding, setOriginBuilding] = useState<Building | null>(null);
  const [showOriginPicker, setShowOriginPicker] = useState(false);
  const [originSearchQuery, setOriginSearchQuery] = useState("");

  const originCoords =
    originBuilding != null
      ? { lat: originBuilding.latitude, lng: originBuilding.longitude }
      : currentBuilding != null
        ? {
            lat: currentBuilding.latitude,
            lng: currentBuilding.longitude,
          }
      : location != null
        ? {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          }
        : null;

  const originLabel =
    originBuilding != null
      ? originBuilding.buildingName
      : currentBuilding != null
        ? currentBuilding.buildingName
        : location != null
          ? "Your location"
          : null;

  const distanceM =
    originCoords != null
      ? Math.round(
          calculateDistance(
            originCoords.lat,
            originCoords.lng,
            building.latitude,
            building.longitude,
          ),
        )
      : null;
  const distanceText =
    distanceM != null
      ? distanceM >= 1000
        ? `${(distanceM / 1000).toFixed(1)} km`
        : `${distanceM} m`
      : "—";

  const filteredBuildings = useMemo(() => {
    if (originSearchQuery.trim() === "") return buildings;
    const q = originSearchQuery.toLowerCase().trim();
    return buildings.filter(
      (b) =>
        b.buildingName.toLowerCase().includes(q) ||
        b.buildingLongName?.toLowerCase().includes(q) ||
        b.buildingCode.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q),
    );
  }, [buildings, originSearchQuery]);

  const [selectedMode, setSelectedMode] = useState<
    "walk" | "bike" | "transit" | "drive" | null
  >(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [steps, setSteps] = useState<DirectionStep[]>([]);
  const [routeError, setRouteError] = useState<string | null>(null);

  const region = {
    latitude: building.latitude,
    longitude: building.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const handleTravelMode = async (
    mode: "walk" | "bike" | "transit" | "drive",
  ) => {
    setSelectedMode(mode);
    setRouteError(null);
    if (originCoords == null) {
      setRouteError("Turn on location or choose a starting point.");
      return;
    }
    setLoadingRoute(true);
    setRouteCoordinates([]);
    setSteps([]);
    try {
      const result = await fetchDirections(
        originCoords.lat,
        originCoords.lng,
        building.latitude,
        building.longitude,
        travelModeFromShort(mode),
      );
      if (result == null) {
        setRouteError("Could not load route.");
        return;
      }
      const coords = decodePolyline(result.encodedPolyline);
      setRouteCoordinates(coords);
      setSteps(result.steps);
    } catch {
      setRouteError("Could not load route.");
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleUseCurrentLocation = () => {
    setOriginBuilding(null);
    setShowOriginPicker(false);
  };

  const handleSelectOriginBuilding = (b: Building) => {
    setOriginBuilding(b);
    setShowOriginPicker(false);
    setOriginSearchQuery("");
  };

  return (
    <View style={styles.screen} testID="poi-detail-screen">
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel="Back to search results"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.titleRow}>
          <Text style={styles.poiName} numberOfLines={1}>
            {building.buildingName}
          </Text>
          <Text style={styles.distance}>{distanceText}</Text>
        </View>
        <Text style={styles.address} numberOfLines={2}>
          {building.address}
        </Text>
      </View>

      <View style={styles.startingPointSection}>
        <Text style={styles.startingPointLabel}>Starting from</Text>
        {originLabel != null ? (
          <Text style={styles.startingPointValue} numberOfLines={1}>
            {originLabel}
          </Text>
        ) : (
          <Text style={styles.startingPointHint}>
            Use current location or choose a building
          </Text>
        )}
        <View style={styles.startingPointActions}>
          {location != null && (
            <Pressable
              style={styles.startingPointButton}
              onPress={handleUseCurrentLocation}
              testID="use-current-location"
            >
              <Text style={styles.startingPointButtonText}>
                Use Current Location
              </Text>
            </Pressable>
          )}
          <Pressable
            style={styles.startingPointButton}
            onPress={() => setShowOriginPicker(true)}
            testID="change-starting-point"
          >
            <Text style={styles.startingPointButtonText}>
              Change starting point
            </Text>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showOriginPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOriginPicker(false)}
      >
        <View style={styles.originModalOverlay}>
          <View style={styles.originModal}>
            <View style={styles.originModalHeader}>
              <Text style={styles.originModalTitle}>Starting point</Text>
              <Pressable
                onPress={() => setShowOriginPicker(false)}
                hitSlop={8}
                accessibilityLabel="Close"
              >
                <Text style={styles.originModalClose}>✕</Text>
              </Pressable>
            </View>
            {location != null && (
              <Pressable
                style={styles.originModalCurrentRow}
                onPress={handleUseCurrentLocation}
                testID="modal-use-current-location"
              >
                <Text style={styles.originModalCurrentLabel}>
                  Use Current Location
                </Text>
                {currentBuilding != null && (
                  <Text style={styles.originModalCurrentBuilding} numberOfLines={1}>
                    ({currentBuilding.buildingName})
                  </Text>
                )}
              </Pressable>
            )}
            <TextInput
              style={styles.originSearchInput}
              placeholder="Search buildings..."
              placeholderTextColor="#888"
              value={originSearchQuery}
              onChangeText={setOriginSearchQuery}
              testID="origin-search-input"
            />
            <FlatList
              data={filteredBuildings}
              keyExtractor={(item) => item.buildingCode}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  style={styles.originBuildingRow}
                  onPress={() => handleSelectOriginBuilding(item)}
                  testID={`origin-building-${item.buildingCode}`}
                >
                  <Text style={styles.originBuildingName} numberOfLines={1}>
                    {item.buildingName}
                  </Text>
                  <Text style={styles.originBuildingAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text style={styles.originEmpty}>
                  {originSearchQuery.trim() === ""
                    ? "No buildings."
                    : "No matches."}
                </Text>
              }
            />
          </View>
        </View>
      </Modal>

      <View style={styles.travelModeRow}>
        {(["walk", "bike", "transit", "drive"] as const).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => handleTravelMode(mode)}
            style={[
              styles.modeButton,
              selectedMode === mode && styles.modeButtonSelected,
            ]}
          >
            <Text style={styles.modeIcon}>
              {mode === "walk"
                ? "🚶"
                : mode === "bike"
                  ? "🚴"
                  : mode === "transit"
                    ? "🚌"
                    : "🚗"}
            </Text>
          </Pressable>
        ))}
        {loadingRoute && (
          <ActivityIndicator size="small" color={COLORS.concordiaMaroon} />
        )}
      </View>

      {routeError != null && (
        <Text style={styles.routeError}>{routeError}</Text>
      )}

      <ScrollView
        style={styles.miscInfo}
        contentContainerStyle={styles.miscInfoContent}
      >
        <Text style={styles.miscText}>
          {building.buildingLongName ?? building.buildingName}
        </Text>
      </ScrollView>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton={false}
        >
          <Marker
            coordinate={{
              latitude: building.latitude,
              longitude: building.longitude,
            }}
            title={building.buildingCode}
            description={building.buildingName}
            pinColor={COLORS.concordiaMaroon}
          />
          {routeCoordinates.length > 0 && (
            <Polyline
              coordinates={routeCoordinates}
              strokeColor={COLORS.concordiaBlue}
              strokeWidth={4}
            />
          )}
        </MapView>
        {steps.length > 0 && (
          <View style={styles.stepsOverlay}>
            <Text style={styles.stepsTitle}>Directions</Text>
            <ScrollView style={{ maxHeight: 160 }} showsVerticalScrollIndicator>
              {steps.map((step, i) => (
                <View key={i} style={styles.stepItem}>
                  <Text style={styles.stepNumber}>{i + 1}</Text>
                  <Text style={styles.stepText}>{step.instruction}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}
