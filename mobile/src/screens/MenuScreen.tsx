import { View } from "react-native";
import ConnectionPanel from "../components/MenuScreen/ConnectionPanel";
import styles from "../styles/Screen";

export default function MenuScreen() {
  return (
    <View style={styles.screen} testID="menu-screen">
      <ConnectionPanel />
    </View>
  );
}
