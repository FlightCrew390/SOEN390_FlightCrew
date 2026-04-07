import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import HomeScreenNavBar from "./src/components/NavBar/NavBar";

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <HomeScreenNavBar />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
