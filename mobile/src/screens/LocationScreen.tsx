import React, { useRef, useState } from "react";
import { InteractionManager, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import CampusSelection from "../components/LocationScreen/CampusSelection";
import GoogleMaps from "../components/LocationScreen/GoogleMaps";
import { CAMPUSES, CampusId } from "../constants/campuses";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { getClosestCampusId } from "../utils/campusDetection";
import styles from "../styles/Screen";

export default function LocationScreen() {
  const mapRef = useRef<MapView | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const { location } = useCurrentLocation();

  const currentCampusId =
    location == null
      ? null
      : getClosestCampusId(location.coords.latitude, location.coords.longitude);

  const handleCampusChange = (campusId: CampusId) => {
    const campus = CAMPUSES[campusId];
    const region: Region = {
      latitude: campus.location.latitude,
      longitude: campus.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    InteractionManager.runAfterInteractions(() => {
      if (mapRef.current) {
        mapRef.current.animateToRegion(region, 1000);
      }
    });
  };

  return (
    <View style={styles.screen} testID="location-screen">
      <View style={styles.mapWrapper}>
        <GoogleMaps
          mapRef={mapRef}
          onRecenter={() => setRecenterTrigger((t) => t + 1)}
        />
      </View>
      <CampusSelection
        onCampusChange={handleCampusChange}
        currentCampusId={currentCampusId}
        recenterTrigger={recenterTrigger}
      />
    </View>
  );
}
