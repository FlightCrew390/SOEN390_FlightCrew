import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";

export default function SearchScreen() {
  return (
    <View style={styles.screen} testID="search-screen">
      <View style={styles.textContainer}>
        <Text style={styles.title}>Search Screen</Text>
      </View>
    </View>
  );
}
