import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function NavigationFooter() {
  const [activeTab, setActiveTab] = React.useState<string>("home");

  return (
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setActiveTab("home")}
      >
        <Ionicons
          name="home"
          size={28}
          color={activeTab === "home" ? "#8b2020" : "#5a5a5a"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setActiveTab("location")}
      >
        <Ionicons
          name="location"
          size={28}
          color={activeTab === "location" ? "#8b2020" : "#5a5a5a"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setActiveTab("search")}
      >
        <Ionicons
          name="search"
          size={28}
          color={activeTab === "search" ? "#8b2020" : "#5a5a5a"}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setActiveTab("menu")}
      >
        <Ionicons
          name="menu"
          size={28}
          color={activeTab === "menu" ? "#8b2020" : "#5a5a5a"}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    height: 100,
    paddingBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "#d0d0d0",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#a0a0a0",
  },
  iconContainer: {
    padding: 10,
  },
});
