import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useCallback, useEffect, useReducer, useRef } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import MapView, {
  Polyline,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { COLORS, MAP_CONFIG } from "../../constants";
import { campusBoundary } from "../../constants/campusBoundaries";
import { useBuildings } from "../../contexts/BuildingContext";
import { useLocation } from "../../contexts/LocationContext";
import { useDirections } from "../../hooks/useDirections";
import { initialMapUIState, mapUIReducer } from "../../reducers/mapUIReducer";
import { LocationType } from "../../state/SearchPanelState";
import styles from "../../styles/GoogleMaps";
import { Building } from "../../types/Building";
import { TravelMode } from "../../types/Directions";
import { findCurrentBuilding } from "../../utils/buildingDetection";
import BuildingMarker from "./BuildingMarker";
import BuildingPolygon from "./BuildingPolygon";
import DirectionPanel from "./DirectionPanel";
import SearchPanel from "./SearchPanel";
import UserLocationMarker from "./UserLocationMarker";

interface GoogleMapsProps {
  readonly mapRef?: React.RefObject<MapView | null>;
  readonly onRecenter?: () => void;
}

export default function GoogleMaps({
  mapRef: mapRefProp,
  onRecenter,
}: Readonly<GoogleMapsProps> = {}) {
  const { buildings, loading, error } = useBuildings();
  const {
    location,
    loading: locationLoading,
    error: locationError,
  } = useLocation();
  const internalMapRef = useRef<MapView>(null);
  const mapRef = mapRefProp ?? internalMapRef;
  const isCorrectingRef = useRef(false);
  const hasCenteredOnUserOnceRef = useRef(false);
  const [state, dispatch] = useReducer(mapUIReducer, initialMapUIState);

  const onRouteLoading = useCallback(
    () => dispatch({ type: "ROUTE_LOADING" }),
    [],
  );
  const onRouteLoaded = useCallback(
    (route: any) => dispatch({ type: "ROUTE_LOADED", route }),
    [],
  );
  const onRouteError = useCallback(
    (err: string) => dispatch({ type: "ROUTE_ERROR", error: err }),
    [],
  );

  const userCoords = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    : null;

  useDirections({
    destination: state.selectedBuilding,
    startBuilding: state.startBuilding,
    userLocation: userCoords,
    travelMode: state.travelMode,
    active: state.panel === "directions",
    onLoading: onRouteLoading,
    onLoaded: onRouteLoaded,
    onError: onRouteError,
  });

  // ── Find current building ──
  useEffect(() => {
    if (location && buildings.length > 0) {
      const building = findCurrentBuilding(
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        buildings,
      );
      dispatch({ type: "SET_CURRENT_BUILDING", building });
    } else {
      dispatch({ type: "SET_CURRENT_BUILDING", building: null });
    }
  }, [location, buildings]);

  // ── Center on user once ──
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
    if (!state.route || !mapRef.current) return;
    const coords = state.route.coordinates;
    if (coords.length < 2) return;

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 200, right: 60, bottom: 300, left: 60 },
      animated: true,
    });
  }, [state.route, mapRef]);

  const handleMapReady = () => {
    if (mapRef.current && Platform.OS === "android") {
      mapRef.current.setMapBoundaries(
        campusBoundary.northEast,
        campusBoundary.southWest,
      );
    }
  };

  const handleRegionChangeComplete = (region: Region) => {
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
  };

  const handleRecenter = () => {
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
  };

  const animateToBuilding = (building: Building) => {
    if (!mapRef.current) return;
    const region = {
      latitude: building.latitude,
      longitude: building.longitude,
      latitudeDelta: 0.003,
      longitudeDelta: 0.003,
    };
    mapRef.current.animateToRegion(region, 800);
  };

  const handleSelectBuilding = (building: Building) => {
    animateToBuilding(building);
    dispatch({ type: "SELECT_BUILDING", building });
  };

  const handleSearch = (query: string, locationType: LocationType) => {
    if (!query) return;

    if (locationType === "building") {
      const q = query.toLowerCase();
      const match = buildings.find(
        (b) =>
          b.buildingName.toLowerCase().includes(q) ||
          b.buildingLongName.toLowerCase().includes(q) ||
          b.buildingCode.toLowerCase() === q,
      );
      if (match) handleSelectBuilding(match);
    }
  };

  const handleTravelModeChange = (mode: TravelMode) => {
    dispatch({ type: "SET_TRAVEL_MODE", mode });
  };

  const displayError = error || locationError;
  const isLoading = loading || locationLoading;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        minZoomLevel={14}
        maxZoomLevel={20}
        cameraZoomRange={{
          minCenterCoordinateDistance: 200,
          maxCenterCoordinateDistance: 20000,
        }}
        onMapReady={handleMapReady}
        onRegionChangeComplete={handleRegionChangeComplete}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        style={styles.map}
        initialRegion={MAP_CONFIG.defaultCampusRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onPress={() => dispatch({ type: "TAP_MAP" })}
      >
        {/* Building polygons and markers */}
        {buildings.flatMap((building) => [
          <BuildingPolygon
            key={`${building.buildingCode}-poly`}
            building={building}
          />,
          <BuildingMarker
            key={`${building.buildingCode}-marker`}
            building={building}
            isCurrentBuilding={
              state.currentBuilding?.buildingCode === building.buildingCode
            }
            isSelected={
              state.selectedBuilding?.buildingCode === building.buildingCode
            }
            isDirectionsOpen={state.panel === "directions"}
            onSelect={() => handleSelectBuilding(building)}
            onDirectionPress={() => {
              animateToBuilding(building);
              dispatch({ type: "OPEN_DIRECTIONS", building });
            }}
          />,
        ])}

        {/* Route polyline */}
        {state.route && state.route.coordinates.length > 1 && (
          <Polyline
            coordinates={state.route.coordinates}
            strokeColor={"#40509F"} // When concordia shuttle routes are added, we can differentiate them by color
            strokeWidth={5}
            lineDashPattern={state.travelMode === "WALK" ? [8, 6] : undefined}
          />
        )}

        {/* User location */}
        {location && (
          <UserLocationMarker
            latitude={location.coords.latitude}
            longitude={location.coords.longitude}
          />
        )}
      </MapView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8b2020" />
          <Text style={styles.loadingText}>
            {loading ? "Loading buildings..." : "Getting your location..."}
          </Text>
        </View>
      )}

      {displayError && !isLoading && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{displayError}</Text>
        </View>
      )}

      {/* Direction panel */}
      <DirectionPanel
        visible={state.panel === "directions"}
        building={state.selectedBuilding}
        startBuilding={state.startBuilding}
        route={state.route}
        routeLoading={state.routeLoading}
        routeError={state.routeError}
        travelMode={state.travelMode}
        onTravelModeChange={handleTravelModeChange}
        onClose={() => dispatch({ type: "CLOSE_PANEL" })}
        onOpenSearch={() => dispatch({ type: "OPEN_SEARCH_FOR_START" })}
        onResetStart={() => dispatch({ type: "RESET_START_BUILDING" })}
      />

      {/* Search panel */}
      <SearchPanel
        visible={state.panel === "search"}
        onClose={() =>
          state.searchOrigin === "directions"
            ? dispatch({ type: "RETURN_TO_DIRECTIONS" })
            : dispatch({ type: "CLOSE_PANEL" })
        }
        onSearch={handleSearch}
        onSelectBuilding={
          state.searchOrigin === "directions"
            ? (building: Building) => {
                dispatch({ type: "SET_START_BUILDING", building });
              }
            : handleSelectBuilding
        }
      />

      {/* Search button */}
      {state.panel !== "directions" && (
        <Pressable
          style={[
            styles.searchButton,
            state.panel === "search" && styles.searchButtonOpen,
          ]}
          onPress={() => {
            if (state.panel === "search") {
              if (state.searchOrigin === "directions") {
                dispatch({ type: "RETURN_TO_DIRECTIONS" });
              } else {
                dispatch({ type: "CLOSE_PANEL" });
              }
            } else {
              dispatch({ type: "OPEN_SEARCH" });
            }
          }}
          accessibilityLabel={
            state.panel === "search"
              ? "Close search"
              : "Search campus buildings"
          }
          accessibilityRole="button"
        >
          <FontAwesome5
            name={(() => {
              if (state.panel !== "search") return "search";
              if (state.searchOrigin === "directions") return "chevron-left";
              return "times";
            })()}
            size={state.panel === "search" ? 30 : 28}
            color={COLORS.concordiaMaroon}
          />
        </Pressable>
      )}

      {/* Recenter button */}
      {location != null && (
        <Pressable
          style={styles.recenterButton}
          onPress={handleRecenter}
          accessibilityLabel="Recenter map on my location"
          accessibilityRole="button"
        >
          <FontAwesome5
            name="location-arrow"
            size={22}
            color={COLORS.concordiaMaroon}
            style={{ transform: [{ rotate: "-45deg" }] }}
          />
        </Pressable>
      )}
    </View>
  );
}
