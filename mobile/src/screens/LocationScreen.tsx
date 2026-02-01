import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";

export default function LocationScreen() {
  return (
    <View style={styles.screen} testID="location-screen">
      <Text>Location Screen</Text>
    </View>
  );
}
