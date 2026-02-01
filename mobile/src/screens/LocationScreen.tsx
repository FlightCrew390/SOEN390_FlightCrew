import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";
import GoogleMaps from "../components/LocationScreen/GoogleMaps";

export default function LocationScreen() {
  return (
    <View style={styles.screen} testID="location-screen">
      <View style={styles.mapWrapper}>
        <GoogleMaps />
      </View>
    </View>
  );
}
