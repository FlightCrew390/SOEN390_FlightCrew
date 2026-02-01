import React from "react";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { Platform, View } from "react-native";
import styles from "../../styles/GoogleMaps";

export default function GoogleMaps() {
  return (
    <View style={styles.container}>
      <MapView
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
      />
    </View>
  );
}
