import { Platform } from "react-native";

// Theme colors for consistency
export const COLORS = {
  concordiaMaroon: "#9C2D2D",
  concordiaMaroonLight: "#8b2020",
  concordiaBlue: "#4a90e2",
  textPrimary: "#333",
  textSecondary: "#666",
  textTertiary: "#888",
  white: "#fff",
  error: "#ff0000",
  shadowBlack: "rgba(0, 0, 0, 0.25)",
  overlayWhite: "rgba(255, 255, 255, 0.9)",
  overlayError: "rgba(255, 0, 0, 0.9)",
};

// API Configuration
export const API_CONFIG = {
  getBaseUrl: () => {
    const backendIp = process.env.EXPO_PUBLIC_BACKEND_IP;

    // If we have an IP in .env, use it for ALL platforms (iOS, Android, etc.)
    if (backendIp) {
      return `http://${backendIp}:9090/api`;
    }

    // Fallback if .env is missing
    return Platform.OS === "android"
      ? "http://10.0.2.2:9090/api"
      : "http://localhost:9090/api";
  },
};

// Map Configuration
export const MAP_CONFIG = {
  concordiaCenter: {
    latitude: 45.4971,
    longitude: -73.579,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  },
  markerSize: {
    width: 40,
    height: 40,
  },
};
