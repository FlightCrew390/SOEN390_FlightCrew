import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Pressable, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants";
import styles from "../../styles/PoiResultsPanel";
import { IndoorRoom } from "../../types/IndoorRoom";

const BUILDING_NAMES: Record<string, string> = {
  Hall: "Henry F. Hall (H) Building",
  CC: "CC Building",
  MB: "John Molson School of Business",
  VE: "Vanier Extension (VE)",
  VL: "Vanier Library (VL)",
};

interface RoomResultsPanelProps {
  readonly results: IndoorRoom[];
  readonly onBack: () => void;
  readonly onSelectRoom: (room: IndoorRoom) => void;
  readonly onDirectionPress: (room: IndoorRoom) => void;
}

export default function RoomResultsPanel({
  results,
  onBack,
  onSelectRoom,
  onDirectionPress,
}: Readonly<RoomResultsPanelProps>) {
  return (
    <View style={styles.container} testID="room-results-panel">
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
          <Text style={styles.headerTitle}>Classrooms</Text>
          <Text style={styles.headerSubtitle}>
            {results.length} {results.length === 1 ? "result" : "results"}
          </Text>
        </View>
      </View>

      {results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No classrooms found.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.resultScroll}
          contentContainerStyle={styles.resultScrollContent}
          showsVerticalScrollIndicator
          onStartShouldSetResponder={() => true}
        >
          {results.map((room, idx) => (
            <View
              key={room.id}
              style={[styles.resultRow, idx % 2 !== 0 && styles.resultRowOdd]}
            >
              <View style={styles.resultContent}>
                <Text style={styles.poiName}>{room.label}</Text>
                <Text style={styles.poiAddress}>
                  {BUILDING_NAMES[room.buildingId] ?? room.buildingId}
                </Text>
              </View>

              <View style={styles.iconRow}>
                <Pressable
                  style={styles.iconButton}
                  onPress={() => onSelectRoom(room)}
                  accessibilityLabel={`Show ${room.label} on map`}
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
                  onPress={() => onDirectionPress(room)}
                  accessibilityLabel={`Get directions to ${room.label}`}
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
      )}
    </View>
  );
}
