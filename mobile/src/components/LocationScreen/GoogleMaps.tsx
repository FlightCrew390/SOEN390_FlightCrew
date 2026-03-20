import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef } from "react";
import { Platform, View } from "react-native";
import MapView, { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { MAP_CONFIG } from "../../constants";
import { useBuildings } from "../../contexts/BuildingContext";
import { IndoorDataService } from "../../services/IndoorDataService";
import { useLocation } from "../../contexts/LocationContext";
import { useMapCamera } from "../../hooks/useMapCamera";
import { useMapUI } from "../../hooks/useMapUI";
import { LocationType } from "../../state/SearchPanelState";
import styles from "../../styles/GoogleMaps";
import { Building } from "../../types/Building";
import { LocationScreenParams } from "../../types/LocationScreenParams";
import { PointOfInterest } from "../../types/PointOfInterest";
import { findBuildingByLocation } from "../../utils/findBuildingByLocation";
import { poiToBuilding } from "../../utils/poiUtils";
import BuildingLayer from "./BuildingLayer";
import DirectionPanel from "./DirectionPanel";
import IndoorFloorView from "./IndoorFloorView";
import MapControls from "./MapControls";
import MapOverlays from "./MapOverlays";
import PoiMarker from "./PoiMarker";
import PoiResultsPanel from "./PoiResultsPanel";
import RoomResultsPanel from "./RoomResultsPanel";
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

  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params ?? {}) as LocationScreenParams;

  const {
    state,
    dispatch,
    userCoords,
    routePreviews,
    selectBuilding,
    openDirections,
    openIndoorView,
    handleSearch,
    handleTravelModeChange,
    selectPoi,
    handleDepartureConfigChange,
  } = useMapUI(buildings, location);

  // Map building codes to indoor JSON buildingIds
  const BUILDING_CODE_TO_INDOOR_ID: Record<string, string> = {
    H: "Hall",
    CC: "CC",
    MB: "MB",
    VE: "VE",
    VL: "VL",
  };

  const selectedBuildingIndoorId = state.selectedBuilding
    ? (BUILDING_CODE_TO_INDOOR_ID[state.selectedBuilding.buildingCode] ?? null)
    : null;

  const indoorFloors = state.indoorBuildingId
    ? IndoorDataService.getFloorsByBuilding(state.indoorBuildingId)
    : [];

  const {
    handleMapReady,
    handleRegionChangeComplete,
    handleRecenter,
    animateToBuilding,
  } = useMapCamera(mapRef, location, state.route, state.panel);

  // ── Handle deep-link from Calendar (or other screens) ──
  useEffect(() => {
    if (!params.directionsTo || buildings.length === 0) return;

    const matched = findBuildingByLocation(params.directionsTo, buildings);
    if (matched) {
      animateToBuilding(matched);
      openDirections(matched);
    }

    // Clear the param so re-focusing the tab doesn't re-trigger
    navigation.setParams({ directionsTo: undefined } as never);
  }, [
    params.directionsTo,
    buildings,
    animateToBuilding,
    openDirections,
    navigation,
  ]);

  const onSelectBuilding = (building: Building) => {
    animateToBuilding(building);
    selectBuilding(building);
  };

  const onDirectionPress = (building: Building) => {
    animateToBuilding(building);
    openDirections(building);
  };

  const onSearchSubmit = (
    query: string,
    locationType: LocationType,
    radiusKm: number | null,
    classroomBuildingId?: string | null,
  ) => {
    const match = handleSearch(
      query,
      locationType,
      radiusKm,
      classroomBuildingId,
    );
    if (match) onSelectBuilding(match);
  };

  const onSelectPoi = (poi: PointOfInterest) => {
    selectPoi(poi);
    mapRef.current?.animateToRegion(
      {
        latitude: poi.latitude,
        longitude: poi.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      },
      500,
    );
  };

  const onPoiDirectionPress = (poi: PointOfInterest) => {
    const building = poiToBuilding(poi);
    selectPoi(poi);
    animateToBuilding(building);
    openDirections(building);
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

        {state.selectedPoi && (
          <PoiMarker
            poi={state.selectedPoi}
            isDirectionsOpen={
              state.panel === "directions" || state.panel === "steps"
            }
            onPress={() => onPoiDirectionPress(state.selectedPoi!)}
            onDirectionPress={() => onPoiDirectionPress(state.selectedPoi!)}
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
        roomLabel={
          state.panel === "room-info"
            ? (state.indoorSelectedRoom?.label ?? null)
            : null
        }
        startBuilding={state.startBuilding}
        route={state.route}
        routeLoading={state.routeLoading}
        routeError={state.routeError}
        travelMode={state.travelMode}
        onTravelModeChange={handleTravelModeChange}
        userLocation={userCoords}
        departureConfig={state.departureConfig}
        onDepartureConfigChange={handleDepartureConfigChange}
        destinationRoom={state.destinationRoom}
        onOpenIndoor={() => {
          if (state.destinationRoom) {
            openIndoorView(
              state.destinationRoom.buildingId,
              state.destinationRoom.floor,
            );
            dispatch({ type: "OPEN_ROOM_INFO", room: state.destinationRoom });
          }
        }}
        onClose={() =>
          state.panel === "room-info"
            ? dispatch({ type: "BACK_TO_INDOOR" })
            : dispatch({ type: "CLOSE_PANEL" })
        }
        onOpenSearch={() => dispatch({ type: "OPEN_SEARCH_FOR_START" })}
        onResetStart={() => dispatch({ type: "RESET_START_BUILDING" })}
        showSteps={state.panel === "steps"}
        onShowSteps={() => dispatch({ type: "OPEN_STEPS" })}
        onHideSteps={() => dispatch({ type: "CLOSE_STEPS" })}
        shuttleEligible={state.shuttleEligible}
        routePreviews={routePreviews}
      />

      {state.panel === "room-results" && (
        <RoomResultsPanel
          results={state.roomResults}
          onBack={() => dispatch({ type: "ROOM_BACK" })}
          onSelectRoom={(room) => {
            const BUILDING_ID_TO_CODE: Record<string, string> = {
              Hall: "H",
              CC: "CC",
              MB: "MB",
              VE: "VE",
              VL: "VL",
            };
            const code =
              BUILDING_ID_TO_CODE[room.buildingId] ?? room.buildingId;
            const building = buildings.find((b) => b.buildingCode === code);
            if (building) {
              animateToBuilding(building);
              selectBuilding(building);
              openIndoorView(room.buildingId, room.floor);
              dispatch({ type: "OPEN_ROOM_INFO", room });
            }
          }}
          onDirectionPress={(room) => {
            const BUILDING_ID_TO_CODE: Record<string, string> = {
              Hall: "H",
              CC: "CC",
              MB: "MB",
              VE: "VE",
              VL: "VL",
            };
            const code =
              BUILDING_ID_TO_CODE[room.buildingId] ?? room.buildingId;
            const building = buildings.find((b) => b.buildingCode === code);
            if (building) {
              animateToBuilding(building);
              openDirections(building, room);
            }
          }}
        />
      )}

      {state.panel === "poi-results" && (
        <PoiResultsPanel
          results={state.poiResults}
          loading={state.poiLoading}
          error={state.poiError}
          onBack={() => dispatch({ type: "BACK_TO_SEARCH" })}
          onSelectPoi={onSelectPoi}
          onDirectionPress={onPoiDirectionPress}
        />
      )}

      {(state.panel === "indoor" || state.panel === "room-info") &&
        state.selectedBuilding &&
        state.indoorBuildingId && (
          <IndoorFloorView
            building={state.selectedBuilding}
            buildingId={state.indoorBuildingId}
            floors={indoorFloors}
            currentFloor={state.indoorFloor ?? indoorFloors[0] ?? 1}
            onFloorChange={(floor) =>
              dispatch({ type: "SET_INDOOR_FLOOR", floor })
            }
            onBack={() => dispatch({ type: "CLOSE_INDOOR" })}
            onRoomPress={(room) => {
              dispatch({ type: "OPEN_ROOM_INFO", room });
            }}
            selectedRoom={state.indoorSelectedRoom}
          />
        )}

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
        hasIndoorData={selectedBuildingIndoorId != null}
        onOpenSearch={() => dispatch({ type: "OPEN_SEARCH" })}
        onCloseSearch={() => dispatch({ type: "CLOSE_PANEL" })}
        onReturnToDirections={() => dispatch({ type: "RETURN_TO_DIRECTIONS" })}
        onRecenter={() => handleRecenter(onRecenter)}
        onOpenIndoor={() => {
          if (selectedBuildingIndoorId) {
            const floors = IndoorDataService.getFloorsByBuilding(
              selectedBuildingIndoorId,
            );
            openIndoorView(selectedBuildingIndoorId, floors[0] ?? 1);
          }
        }}
      />
    </View>
  );
}
