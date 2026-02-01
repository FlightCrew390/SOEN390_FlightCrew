import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";

export default function HomeScreen() {
  return (
    <View style={styles.screen} testID="home-screen">
      <Text>Home Screen</Text>
    </View>
  );
}
