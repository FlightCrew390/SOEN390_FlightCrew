import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreenNavBar from "./src/components/NavBar/NavBar";
import POIDetailScreen from "./src/screens/POIDetailScreen";
import { RootStackParamList } from "./src/types/NavBar";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: true }}
        initialRouteName="MainTabs"
      >
        <Stack.Screen
          name="MainTabs"
          component={HomeScreenNavBar}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="POIDetail"
          component={POIDetailScreen}
          options={{ title: "Directions" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
