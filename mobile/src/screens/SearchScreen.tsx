import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { useBuildingData } from "../hooks/useBuildingData";
import { RootStackParamList } from "../types/NavBar";
import { Building } from "../types/Building";
import styles from "../styles/SearchScreen";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { buildings, loading, error } = useBuildingData();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (query.trim() === "") return buildings;
    const q = query.toLowerCase().trim();
    return buildings.filter(
      (b) =>
        b.buildingName.toLowerCase().includes(q) ||
        b.buildingLongName?.toLowerCase().includes(q) ||
        b.buildingCode.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q),
    );
  }, [buildings, query]);

  const onSelectBuilding = (building: Building) => {
    navigation.navigate("POIDetail", { building });
  };

  const renderItem = ({ item }: { item: Building }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => onSelectBuilding(item)}
      testID={`search-result-${item.buildingCode}`}
    >
      <Text style={styles.listItemTitle}>{item.buildingName}</Text>
      <Text style={styles.listItemSubtitle} numberOfLines={1}>
        {item.address}
      </Text>
    </Pressable>
  );

  return (
    <View style={styles.screen} testID="search-screen">
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search buildings..."
        placeholderTextColor="#888"
        value={query}
        onChangeText={setQuery}
        testID="search-input"
      />
      {loading && <Text style={styles.message}>Loading buildings...</Text>}
      {error != null && <Text style={styles.error}>{error}</Text>}
      {!loading && error == null && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.buildingCode}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.message}>
              {query.trim() === "" ? "No buildings." : "No matches."}
            </Text>
          }
        />
      )}
    </View>
  );
}
