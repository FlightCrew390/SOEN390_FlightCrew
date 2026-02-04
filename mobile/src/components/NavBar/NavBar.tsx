import { Ionicons } from "@expo/vector-icons";
import {
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import HomeScreen from "../../screens/HomeScreen";
import LocationScreen from "../../screens/LocationScreen";
import MenuScreen from "../../screens/MenuScreen";
import SearchScreen from "../../screens/SearchScreen";
import { RootTabParamList } from "../../types/NavBar";

const Tab: ReturnType<typeof createBottomTabNavigator<RootTabParamList>> =
  createBottomTabNavigator();

const screenOptions = ({
  route,
}: {
  route: RouteProp<RootTabParamList>;
}): BottomTabNavigationOptions => ({
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
});

export default function HomeScreenNavBar() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="location" component={LocationScreen} />
      <Tab.Screen name="search" component={SearchScreen} />
      <Tab.Screen name="menu" component={MenuScreen} />
    </Tab.Navigator>
  );
}
