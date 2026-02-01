import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";

export default function MenuScreen() {
  return (
    <View style={styles.screen} testID="menu-screen">
      <Text>Menu Screen</Text>
    </View>
  );
}
