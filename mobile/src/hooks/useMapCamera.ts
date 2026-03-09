import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import MapView, { Region } from "react-native-maps";
import { campusBoundary } from "../constants/campusBoundaries";
import { Building } from "../types/Building";
import { RouteInfo } from "../types/Directions";

interface LocationObject {
  coords: { latitude: number; longitude: number };
}

type Panel = "none" | "search" | "directions" | "steps" | "poi-results";

export function useMapCamera(
  mapRef: React.RefObject<MapView | null>,
  location: LocationObject | null,
  route: RouteInfo | null,
  panel: Panel,
) {
  const isCorrectingRef = useRef(false);
  const hasCenteredOnUserOnceRef = useRef(false);

  // ── Center on user location once ──
  useEffect(() => {
    if (!location || !mapRef.current || hasCenteredOnUserOnceRef.current)
      return;
    hasCenteredOnUserOnceRef.current = true;
    const region = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    requestIdleCallback(() => {
      if (mapRef.current) mapRef.current.animateToRegion(region, 1000);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // ── Fit map to route when it loads ──
  useEffect(() => {
    if (!route || !mapRef.current) return;
    const coords = route.coordinates;
    if (coords.length < 2) return;

    const paddingByPanel: Record<
      string,
      { top: number; right: number; bottom: number; left: number }
    > = {
      steps: { top: 250, right: 50, bottom: 50, left: 50 },
      directions: { top: 380, right: 0, bottom: 80, left: 0 },
    };

    const edgePadding = paddingByPanel[panel] ?? {
      top: 200,
      right: 60,
      bottom: 300,
      left: 60,
    };

    mapRef.current.fitToCoordinates(coords, {
      edgePadding,
      animated: true,
    });
  }, [route, mapRef, panel]);

  // ── Map-ready handler (Android boundary setup) ──
  const handleMapReady = useCallback(() => {
    if (mapRef.current && Platform.OS === "android") {
      mapRef.current.setMapBoundaries(
        campusBoundary.northEast,
        campusBoundary.southWest,
      );
    }
  }, [mapRef]);

  // ── Enforce campus boundaries on region change ──
  const handleRegionChangeComplete = useCallback(
    (region: Region) => {
      if (!mapRef.current || isCorrectingRef.current) return;

      let needsCorrection = false;
      const correctedRegion = { ...region };

      if (region.latitude > campusBoundary.northEast.latitude) {
        correctedRegion.latitude = campusBoundary.northEast.latitude;
        needsCorrection = true;
      }
      if (region.latitude < campusBoundary.southWest.latitude) {
        correctedRegion.latitude = campusBoundary.southWest.latitude;
        needsCorrection = true;
      }
      if (region.longitude > campusBoundary.northEast.longitude) {
        correctedRegion.longitude = campusBoundary.northEast.longitude;
        needsCorrection = true;
      }
      if (region.longitude < campusBoundary.southWest.longitude) {
        correctedRegion.longitude = campusBoundary.southWest.longitude;
        needsCorrection = true;
      }

      if (needsCorrection) {
        isCorrectingRef.current = true;
        mapRef.current.animateToRegion(correctedRegion, 300);
        setTimeout(() => {
          isCorrectingRef.current = false;
        }, 400);
      }
    },
    [mapRef],
  );

  // ── Recenter on user location ──
  const handleRecenter = useCallback(
    (onRecenter?: () => void) => {
      if (location == null || mapRef.current == null) return;
      onRecenter?.();
      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      requestIdleCallback(() => {
        if (mapRef.current) mapRef.current.animateToRegion(region, 1000);
      });
    },
    [location, mapRef],
  );

  // ── Animate to a specific building ──
  const animateToBuilding = useCallback(
    (building: Building) => {
      if (!mapRef.current) return;
      const region = {
        latitude: building.latitude,
        longitude: building.longitude,
        latitudeDelta: 0.003,
        longitudeDelta: 0.003,
      };
      mapRef.current.animateToRegion(region, 800);
    },
    [mapRef],
  );

  return {
    handleMapReady,
    handleRegionChangeComplete,
    handleRecenter,
    animateToBuilding,
  };
}
