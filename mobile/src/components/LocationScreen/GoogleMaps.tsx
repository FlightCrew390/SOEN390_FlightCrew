import React, { useRef } from "react";
import MapView, {
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import { Platform, View } from "react-native";
import styles from "../../styles/GoogleMaps";
import { campusBoundary } from "../../constants/campusBoundaries";

export default function GoogleMaps() {
  const mapRef = useRef<MapView>(null);
  const isCorrectingRef = useRef(false);

  const handleMapReady = () => {
    if (mapRef.current && Platform.OS === "android") {
      mapRef.current.setMapBoundaries(
        campusBoundary.northEast,
        campusBoundary.southWest
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
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={styles.map}
        initialRegion={{
          latitude: 45.4971,
          longitude: -73.579,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        minZoomLevel={14}
        maxZoomLevel={20}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
      />
    </View>
  );
}
