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
        initialRouteName="MainTabs"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="MainTabs" component={HomeScreenNavBar} />
        <Stack.Screen name="POIDetail" component={POIDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
