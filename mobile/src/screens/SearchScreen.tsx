import React from "react";
import { Text, View } from "react-native";
import styles from "../styles/Screen";

export default function SearchScreen() {
  return (
    <View style={styles.screen} testID="search-screen">
      <Text>Search Screen</Text>
    </View>
  );
}
