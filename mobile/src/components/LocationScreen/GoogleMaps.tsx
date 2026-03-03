import React, { useRef } from "react";
import { Platform, View } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_CONFIG } from "../../constants";
import { useBuildings } from "../../contexts/BuildingContext";
import { useLocation } from "../../contexts/LocationContext";
import { useMapCamera } from "../../hooks/useMapCamera";
import { useMapUI } from "../../hooks/useMapUI";
import { LocationType } from "../../state/SearchPanelState";
import styles from "../../styles/GoogleMaps";
import { Building } from "../../types/Building";
import BuildingLayer from "./BuildingLayer";
import DirectionPanel from "./DirectionPanel";
import MapControls from "./MapControls";
import MapOverlays from "./MapOverlays";
import RoutePolyline from "./RoutePolyline";
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

  const {
    state,
    dispatch,
    selectBuilding,
    openDirections,
    handleSearch,
    handleTravelModeChange,
    handleDepartureConfigChange,
  } = useMapUI(buildings, location);

  const {
    handleMapReady,
    handleRegionChangeComplete,
    handleRecenter,
    animateToBuilding,
  } = useMapCamera(mapRef, location, state.route, state.panel);

  const onSelectBuilding = (building: Building) => {
    animateToBuilding(building);
    selectBuilding(building);
  };

  const onDirectionPress = (building: Building) => {
    animateToBuilding(building);
    openDirections(building);
  };

  const onSearchSubmit = (query: string, locationType: LocationType) => {
    const match = handleSearch(query, locationType);
    if (match) onSelectBuilding(match);
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
          maxCenterCoordinateDistance: 200000,
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
        <BuildingLayer
          buildings={buildings}
          currentBuildingCode={state.currentBuilding?.buildingCode ?? null}
          selectedBuildingCode={state.selectedBuilding?.buildingCode ?? null}
          isDirectionsOpen={state.panel === "directions"}
          onSelect={onSelectBuilding}
          onDirectionPress={onDirectionPress}
        />

        <RoutePolyline route={state.route} travelMode={state.travelMode} />

        {location && (
          <UserLocationMarker
            latitude={location.coords.latitude}
            longitude={location.coords.longitude}
          />
        )}
      </MapView>

      <MapOverlays
        isLoading={isLoading}
        isBuildingsLoading={loading}
        error={displayError && !isLoading ? displayError : null}
      />

      <DirectionPanel
        visible={state.panel === "directions" || state.panel === "steps"}
        building={state.selectedBuilding}
        startBuilding={state.startBuilding}
        route={state.route}
        routeLoading={state.routeLoading}
        routeError={state.routeError}
        travelMode={state.travelMode}
        onTravelModeChange={handleTravelModeChange}
        departureConfig={state.departureConfig}
        onDepartureConfigChange={handleDepartureConfigChange}
        onClose={() => dispatch({ type: "CLOSE_PANEL" })}
        onOpenSearch={() => dispatch({ type: "OPEN_SEARCH_FOR_START" })}
        onResetStart={() => dispatch({ type: "RESET_START_BUILDING" })}
        showSteps={state.panel === "steps"}
        onShowSteps={() => dispatch({ type: "OPEN_STEPS" })}
        onHideSteps={() => dispatch({ type: "CLOSE_STEPS" })}
      />

      <SearchPanel
        visible={state.panel === "search"}
        onClose={() =>
          state.searchOrigin === "directions"
            ? dispatch({ type: "RETURN_TO_DIRECTIONS" })
            : dispatch({ type: "CLOSE_PANEL" })
        }
        onSearch={onSearchSubmit}
        onSelectBuilding={
          state.searchOrigin === "directions"
            ? (building: Building) => {
                dispatch({ type: "SET_START_BUILDING", building });
              }
            : onSelectBuilding
        }
      />

      <MapControls
        panel={state.panel}
        searchOrigin={state.searchOrigin}
        hasLocation={location != null}
        onOpenSearch={() => dispatch({ type: "OPEN_SEARCH" })}
        onCloseSearch={() => dispatch({ type: "CLOSE_PANEL" })}
        onReturnToDirections={() => dispatch({ type: "RETURN_TO_DIRECTIONS" })}
        onRecenter={() => handleRecenter(onRecenter)}
      />
    </View>
  );
}
