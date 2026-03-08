import { View } from "react-native";
import Calendar from "../components/HomeScreen/Calendar";
import styles from "../styles/Screen";

export default function HomeScreen() {
  return (
    <View style={styles.screen} testID="home-screen">
      <Calendar />
    </View>
  );
}
