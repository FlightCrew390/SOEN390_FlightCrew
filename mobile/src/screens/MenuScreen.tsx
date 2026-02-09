import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";

export default function MenuScreen() {
  return (
    <View style={styles.screen} testID="menu-screen">
      <View style={styles.textContainer}>
        <Text style={styles.title}>Menu Screen</Text>
      </View>
    </View>
  );
}
