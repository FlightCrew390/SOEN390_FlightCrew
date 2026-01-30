import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "./src/screens/HomeScreen";
import LocationScreen from "./src/screens/LocationScreen";
import MenuScreen from "./src/screens/MenuScreen";
import SearchScreen from "./src/screens/SearchScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            iconName = route.name as keyof typeof Ionicons.glyphMap;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#8b2020",
          tabBarInactiveTintColor: "#5a5a5a",
          tabBarStyle: {
            height: 100,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: "#d0d0d0",
            borderTopWidth: 1,
            borderTopColor: "#a0a0a0",
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="home" component={HomeScreen} />
        <Tab.Screen name="location" component={LocationScreen} />
        <Tab.Screen name="search" component={SearchScreen} />
        <Tab.Screen name="menu" component={MenuScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
