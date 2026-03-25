import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/PoiResultsPanel";
import { PointOfInterest } from "../../types/PointOfInterest";

interface PoiResultsPanelProps {
  readonly results: PointOfInterest[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly onBack: () => void;
  readonly onSelectPoi: (poi: PointOfInterest) => void;
  readonly onDirectionPress: (poi: PointOfInterest) => void;
}

function categoryLabel(category: string): string {
  switch (category) {
    case "cafe":
      return "Cafes";
    case "restaurant":
      return "Restaurants";
    case "pharmacy":
      return "Pharmacies";
    case "bar":
      return "Bars";
    case "grocery":
      return "Groceries";
    default:
      return "Results";
  }
}

export default function PoiResultsPanel({
  results,
  loading,
  error,
  onBack,
  onSelectPoi,
  onDirectionPress,
}: Readonly<PoiResultsPanelProps>) {
  const title =
    results.length > 0 ? categoryLabel(results[0].category) : "Results";

  let content: React.ReactNode;
  if (loading) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.concordiaMaroon} />
        <Text style={styles.loadingText}>Searching…</Text>
      </View>
    );
  } else if (error) {
    content = <Text style={styles.errorText}>{error}</Text>;
  } else if (results.length === 0) {
    content = (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No results found.</Text>
      </View>
    );
  } else {
    content = (
      <ScrollView
        style={styles.resultScroll}
        contentContainerStyle={styles.resultScrollContent}
        showsVerticalScrollIndicator
        onStartShouldSetResponder={() => true}
      >
        {results.map((poi, idx) => (
          <View
            key={`poi-${poi.name}-${idx}`}
            style={[styles.resultRow, idx % 2 !== 0 && styles.resultRowOdd]}
          >
            <View style={styles.resultContent}>
              <Text style={styles.poiName}>{poi.name}</Text>
              <Text style={styles.poiAddress}>{poi.address}</Text>
              {poi.description ? (
                <Text style={styles.poiDescription} numberOfLines={2}>
                  {poi.description}
                </Text>
              ) : null}
            </View>

            <View style={styles.iconRow}>
              <Pressable
                style={styles.iconButton}
                onPress={() => onSelectPoi(poi)}
                accessibilityLabel={`Show ${poi.name} on map`}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="map-pin"
                  size={20}
                  color={COLORS.concordiaMaroon}
                />
              </Pressable>

              <Pressable
                style={styles.iconButton}
                onPress={() => onDirectionPress(poi)}
                accessibilityLabel={`Get directions to ${poi.name}`}
                accessibilityRole="button"
              >
                <FontAwesome5
                  name="directions"
                  size={20}
                  color={COLORS.concordiaMaroon}
                />
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container} testID="poi-results-panel">
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel="Back to search"
          accessibilityRole="button"
        >
          <FontAwesome5
            name="chevron-left"
            size={22}
            color={COLORS.concordiaMaroon}
          />
        </Pressable>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
        </View>
      </View>

      {/* Content */}
      {content}
    </View>
  );
}
