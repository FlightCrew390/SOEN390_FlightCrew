import "dotenv/config";
import { ConfigContext, ExpoConfig } from "expo/config";

const appConfig = ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "mobile",
  slug: "mobile",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  scheme: "com.soen390.flightcrew",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  plugins: ["expo-secure-store", "expo-web-browser", "expo-font"],
  extra: {
    eas: {
      projectId: "ad668e4e-5aaa-4ecb-b642-cfafaf77bbab",
    },
  },
  ios: {
    bundleIdentifier: "com.flightcrew.mobile",
    supportsTablet: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true, // Allow HTTP requests, NEED TO BE SECURE IN PRODUCTION //NOSONAR
      },
      NSLocationWhenInUseUsageDescription:
        "We need your location to show which building you're currently in.",
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: [
            // Reversed iOS client ID — replace with your actual value
            `com.googleusercontent.apps.${process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.split(".")[0]}`,
          ],
        },
      ],
    },
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    },
  },
  android: {
    package: "com.anonymous.mobile",
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
