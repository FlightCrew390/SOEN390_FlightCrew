import React, { useRef } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import MapView, {
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { MAP_CONFIG } from "../../constants";
import { campusBoundary } from "../../constants/campusBoundaries";
import { useBuildingData } from "../../hooks/useBuildingData";
import styles from "../../styles/GoogleMaps";
import BuildingMarker from "./BuildingMarker";

interface GoogleMapsProps {
  mapRef: React.RefObject<MapView | null>;
}

export default function GoogleMaps({
  mapRef,
}: Readonly<GoogleMapsProps>): React.ReactElement {
  const { buildings, loading, error } = useBuildingData();
  const isCorrectingRef = useRef(false);

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
        initialRegion={MAP_CONFIG.concordiaCenter}
      >
        {buildings.map((building) => (
          <BuildingMarker key={building.buildingCode} building={building} />
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8b2020" />
          <Text style={styles.loadingText}>Loading buildings...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
}
