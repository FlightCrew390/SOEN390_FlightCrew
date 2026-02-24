import { useRef, useState } from "react";
import { View } from "react-native";
import MapView, { Region } from "react-native-maps";
import CampusSelection from "../components/LocationScreen/CampusSelection";
import GoogleMaps from "../components/LocationScreen/GoogleMaps";
import { CAMPUSES, CampusId } from "../constants/campuses";
import { BuildingProvider } from "../contexts/BuildingContext";
import { LocationProvider, useLocation } from "../contexts/LocationContext";
import styles from "../styles/Screen";
import { getClosestCampusId } from "../utils/campusDetection";

function LocationScreenContent() {
  const mapRef = useRef<MapView | null>(null);
  const { location } = useLocation();

  const currentCampusId =
    location == null
      ? null
      : getClosestCampusId(location.coords.latitude, location.coords.longitude);

  const [activeCampusId, setActiveCampusId] = useState<CampusId>(
    currentCampusId ?? "SGW",
  );

  const handleCampusChange = (campusId: CampusId) => {
    const campus = CAMPUSES[campusId];
    const region: Region = {
      latitude: campus.location.latitude,
      longitude: campus.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    requestIdleCallback(() => {
      mapRef.current?.animateToRegion(region, 1000);
    });
  };

  const handleRecenter = () => {
    if (currentCampusId) setActiveCampusId(currentCampusId);
  };

  return (
    <View style={styles.screen} testID="location-screen">
      <View style={styles.mapWrapper}>
        <GoogleMaps mapRef={mapRef} onRecenter={handleRecenter} />
      </View>
      <CampusSelection
        activeCampusId={activeCampusId}
        onCampusChange={(id) => {
          setActiveCampusId(id);
          handleCampusChange(id);
        }}
      />
    </View>
  );
}

export default function LocationScreen() {
  return (
    <LocationProvider>
      <BuildingProvider>
        <LocationScreenContent />
      </BuildingProvider>
    </LocationProvider>
  );
}
