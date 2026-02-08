import { useState, useEffect } from "react";
import * as Location from "expo-location";

interface LocationState {
  location: Location.LocationObject | null;
  loading: boolean;
  error: string | null;
}

export const useCurrentLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        // Request permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (!isMounted) return;

        if (status !== "granted") {
          setState({
            location: null,
            loading: false,
            error:
              "Location permission denied. Please enable location access in settings.",
          });
          return;
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) return;

        setState({
          location,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!isMounted) return;

        const errorMessage =
          err instanceof Error
            ? err.message
            : "Unable to determine your location. Please check your GPS settings.";

        setState({
          location: null,
          loading: false,
          error: errorMessage,
        });
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
};
