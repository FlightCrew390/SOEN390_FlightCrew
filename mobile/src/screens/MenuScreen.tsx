import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MenuScreen() {
  return (
    <View style={styles.screen}>
      <Text>Menu Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
