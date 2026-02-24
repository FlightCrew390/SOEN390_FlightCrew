import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Region } from "react-native-maps";
import CampusSelection from "../components/LocationScreen/CampusSelection";
import GoogleMaps from "../components/LocationScreen/GoogleMaps";
import { CAMPUSES, CampusId } from "../constants/campuses";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { RootStackParamList } from "../types/NavBar";
import { Building } from "../types/Building";
import styles from "../styles/Screen";
import { getClosestCampusId } from "../utils/campusDetection";

type RootStackNavProp = NativeStackNavigationProp<
  RootStackParamList,
  keyof RootStackParamList
>;

export default function LocationScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const { location } = useCurrentLocation();

  const handleBuildingPress = (building: Building) => {
    const root = navigation.getParent<RootStackNavProp>();
    root?.navigate("POIDetail", { building });
  };

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
    requestIdleCallback(() => {
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
          onBuildingPress={handleBuildingPress}
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
