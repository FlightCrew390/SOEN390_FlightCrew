import { StyleSheet, View } from "react-native";
import NavigationFooter from "./src/components/NavigationFooter/NavigationFooter";

export default function App() {
  return (
    <View style={styles.container}>
      <View style={styles.mapContainer} />
      <NavigationFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#e5e5e5",
  },
});
