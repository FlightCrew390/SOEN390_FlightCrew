import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useBuildingData } from "../hooks/useBuildingData";
import { useCurrentLocation } from "../hooks/useCurrentLocation";
import { findCurrentBuilding } from "../utils/buildingDetection";
import { RootStackParamList } from "../types/NavBar";
import { Building } from "../types/Building";
import { COLORS } from "../constants";

type POIDetailRouteProp = RouteProp<RootStackParamList, "POIDetail">;

export default function POIDetailScreen() {
  const route = useRoute<POIDetailRouteProp>();
  const { building: destinationBuilding } = route.params;
  const { location } = useCurrentLocation();
  const { buildings } = useBuildingData();

  const [startingPointBuilding, setStartingPointBuilding] =
    useState<Building | null>(null);
  const [showChangeOriginModal, setShowChangeOriginModal] = useState(false);
  const [originSearch, setOriginSearch] = useState("");

  const detectedBuilding =
    location != null && buildings.length > 0
      ? findCurrentBuilding(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          buildings,
        )
      : null;

  const displayStartingPoint = startingPointBuilding ?? detectedBuilding;
  const displayStartingLabel = startingPointBuilding
    ? startingPointBuilding.buildingName
    : detectedBuilding
      ? detectedBuilding.buildingName
      : "Your location";

  const handleUseCurrentLocation = () => {
    if (detectedBuilding != null) {
      setStartingPointBuilding(detectedBuilding);
    } else {
      setStartingPointBuilding(null);
    }
    setShowChangeOriginModal(false);
  };

  const filteredBuildings =
    originSearch.trim() === ""
      ? buildings
      : buildings.filter(
          (b) =>
            b.buildingName
              .toLowerCase()
              .includes(originSearch.trim().toLowerCase()) ||
            b.buildingCode
              .toLowerCase()
              .includes(originSearch.trim().toLowerCase()),
        );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 12, color: COLORS.textTertiary }}>
          Destination
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: COLORS.textPrimary,
          }}
        >
          {destinationBuilding.buildingName}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: COLORS.textSecondary,
            marginTop: 4,
          }}
        >
          {destinationBuilding.address}
        </Text>
      </View>

      <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: "#eee" }}>
        <Text style={{ fontSize: 12, color: COLORS.textTertiary }}>
          Starting from
        </Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: COLORS.textPrimary,
            marginTop: 4,
          }}
          testID="starting-point-label"
        >
          {displayStartingLabel}
        </Text>
        {detectedBuilding != null &&
          displayStartingPoint?.buildingCode ===
            detectedBuilding.buildingCode && (
            <Text
              style={{
                fontSize: 12,
                color: COLORS.concordiaMaroon,
                marginTop: 4,
              }}
            >
              Detected building confirmed
            </Text>
          )}

        <Pressable
          testID="use-current-location"
          onPress={handleUseCurrentLocation}
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: COLORS.concordiaMaroonLight,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Use Current Location
          </Text>
        </Pressable>

        <Pressable
          testID="change-starting-point"
          onPress={() => setShowChangeOriginModal(true)}
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: COLORS.overlayWhite,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: "#ccc",
          }}
        >
          <Text
            style={{
              color: COLORS.textPrimary,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Change starting point
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={showChangeOriginModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowChangeOriginModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "70%",
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
              Starting point
            </Text>
            <TextInput
              testID="origin-search-input"
              placeholder="Search buildings..."
              value={originSearch}
              onChangeText={setOriginSearch}
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 12,
              }}
            />
            <ScrollView style={{ maxHeight: 300 }}>
              {filteredBuildings.map((b) => (
                <Pressable
                  key={b.buildingCode}
                  testID={`origin-building-${b.buildingCode}`}
                  onPress={() => {
                    setStartingPointBuilding(b);
                    setShowChangeOriginModal(false);
                    setOriginSearch("");
                  }}
                  style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                >
                  <Text style={{ fontWeight: "600" }}>{b.buildingName}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>
                    {b.buildingCode} · {b.address}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              onPress={() => setShowChangeOriginModal(false)}
              style={{ marginTop: 12, padding: 12 }}
            >
              <Text
                style={{
                  color: COLORS.concordiaMaroon,
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
