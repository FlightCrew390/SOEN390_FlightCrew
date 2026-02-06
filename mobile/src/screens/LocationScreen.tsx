import React from "react";
import { View } from "react-native";
import CampusSelection from "../components/LocationScreen/CampusSelection";
import GoogleMaps from "../components/LocationScreen/GoogleMaps";
import styles from "../styles/Screen";

export default function LocationScreen() {
  const handleCampusChange = (campus: string) => {
    // #TODO Handle campus navigation logic
    console.log("Campus changed:", campus);
  };
  return (
    <View style={styles.screen} testID="location-screen">
      <View style={styles.mapWrapper}>
        <GoogleMaps />
      </View>
      <CampusSelection onCampusChange={handleCampusChange} />
    </View>
  );
}
