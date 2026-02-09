import { ExpoConfig, ConfigContext } from "expo/config";
import "dotenv/config";

const appConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "mobile",
  slug: "mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true, // Allow HTTP requests, NEED TO BE SECURE IN PRODUCTION //NOSONAR
      },
      NSLocationWhenInUseUsageDescription:
        "We need your location to show which building you're currently in.",
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    package: "com.yourteam.mobile",
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.INTERNET",
    ],
    // @ts-ignore
    usesCleartextTraffic: true, // Allow HTTP requests, NEED TO BE SECURE IN PRODUCTION //NOSONAR
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: "./assets/favicon.png",
  },
});

export default appConfig;
