import React, { useRef } from "react";
import { View } from "react-native";
import MapView, { Region } from "react-native-maps";
import CampusSelection from "../components/LocationScreen/CampusSelection";
import GoogleMaps from "../components/LocationScreen/GoogleMaps";
import { CAMPUSES, CampusId } from "../constants/campuses";
import styles from "../styles/Screen";

export default function LocationScreen() {
  const mapRef = useRef<MapView | null>(null);

  const handleCampusChange = (campusId: CampusId) => {
    const campus = CAMPUSES[campusId];
    const region: Region = {
      latitude: campus.location.latitude,
      longitude: campus.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  };

  return (
    <View style={styles.screen} testID="location-screen">
      <View style={styles.mapWrapper}>
        <GoogleMaps mapRef={mapRef} />
      </View>
      <CampusSelection onCampusChange={handleCampusChange} />
    </View>
  );
}
