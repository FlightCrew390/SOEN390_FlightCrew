import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useRef, useEffect, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import MapView, {
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { COLORS, MAP_CONFIG } from "../../constants";
import { campusBoundary } from "../../constants/campusBoundaries";
import { useBuildingData } from "../../hooks/useBuildingData";
import { useCurrentLocation } from "../../hooks/useCurrentLocation";
import { findCurrentBuilding } from "../../utils/buildingDetection";
import { Building } from "../../types/Building";
import styles from "../../styles/GoogleMaps";
import BuildingMarker from "./BuildingMarker";
import UserLocationMarker from "./UserLocationMarker";

interface GoogleMapsProps {
  readonly mapRef?: React.RefObject<MapView | null>;
  /** Called when user taps recenter so parent can sync campus selector to actual location. */
  readonly onRecenter?: () => void;
}

export default function GoogleMaps({
  mapRef: mapRefProp,
  onRecenter,
}: Readonly<GoogleMapsProps> = {}) {
  const { buildings, loading, error } = useBuildingData();
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useCurrentLocation();
  const internalMapRef = useRef<MapView>(null);
  const mapRef = mapRefProp ?? internalMapRef;
  const isCorrectingRef = useRef(false);
  const hasCenteredOnUserOnceRef = useRef(false);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);

  // Find current building when location or buildings change
  useEffect(() => {
    if (location && buildings.length > 0) {
      const building = findCurrentBuilding(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        buildings,
      );
      setCurrentBuilding(building);
    } else {
      setCurrentBuilding(null);
    }
  }, [location, buildings]);

  // When location first loads, center map on user once so they see their position
  useEffect(() => {
    if (!location || !mapRef.current || hasCenteredOnUserOnceRef.current)
      return;
    hasCenteredOnUserOnceRef.current = true;
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    InteractionManager.runAfterInteractions(() => {
      if (mapRef.current) mapRef.current.animateToRegion(region, 1000);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mapRef stable; run only when location appears
  }, [location]);

  const handleMapReady = () => {
    if (mapRef.current && Platform.OS === "android") {
      mapRef.current.setMapBoundaries(
        campusBoundary.northEast,
        campusBoundary.southWest,
      );
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
    if (!mapRef.current || isCorrectingRef.current) return;

    let needsCorrection = false;
    const correctedRegion = { ...region };

    if (region.latitude > campusBoundary.northEast.latitude) {
      correctedRegion.latitude = campusBoundary.northEast.latitude;
      needsCorrection = true;
    }
    if (region.latitude < campusBoundary.southWest.latitude) {
      correctedRegion.latitude = campusBoundary.southWest.latitude;
      needsCorrection = true;
    }
    if (region.longitude > campusBoundary.northEast.longitude) {
      correctedRegion.longitude = campusBoundary.northEast.longitude;
      needsCorrection = true;
    }
    if (region.longitude < campusBoundary.southWest.longitude) {
      correctedRegion.longitude = campusBoundary.southWest.longitude;
      needsCorrection = true;
    }

    if (needsCorrection) {
      isCorrectingRef.current = true;
      mapRef.current.animateToRegion(correctedRegion, 300);
      setTimeout(() => {
        isCorrectingRef.current = false;
      }, 400);
    }
  };

  const handleRecenter = () => {
    if (location == null || mapRef.current == null) return;
    onRecenter?.();
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    InteractionManager.runAfterInteractions(() => {
      if (mapRef.current) mapRef.current.animateToRegion(region, 1000);
    });
  };

  const displayError = error || locationError;
  const isLoading = loading || locationLoading;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        minZoomLevel={14}
        maxZoomLevel={20}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={styles.map}
        initialRegion={MAP_CONFIG.defaultCampusRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {buildings.map((building) => (
          <BuildingMarker
            key={building.buildingCode}
            building={building}
            isCurrentBuilding={
              currentBuilding?.buildingCode === building.buildingCode
            }
          />
        ))}
        {location && (
          <UserLocationMarker
            latitude={location.coords.latitude}
            longitude={location.coords.longitude}
          />
        )}
      </MapView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8b2020" />
          <Text style={styles.loadingText}>
            {loading ? "Loading buildings..." : "Getting your location..."}
          </Text>
        </View>
      )}

      {displayError && !isLoading && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}

      {location != null && (
        <Pressable
          style={styles.recenterButton}
          onPress={handleRecenter}
          accessibilityLabel="Recenter map on my location"
          accessibilityRole="button"
        >
          <FontAwesome5
            name="location-arrow"
            size={22}
            color={COLORS.concordiaMaroon}
            style={{ transform: [{ rotate: "-45deg" }] }}
          />
        </Pressable>
      )}
    </View>
  );
}
