import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import styles from "../../styles/SearchPanel";
import { useBuildingData } from "../../hooks/useBuildingData";

export type LocationType = "building" | "restaurant";

interface SearchPanelProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSearch: (query: string, locationType: LocationType) => void;
}

const LOCATION_OPTIONS: { key: LocationType; label: string }[] = [
  { key: "building", label: "Campus Building" },
  { key: "restaurant", label: "Restaurant" },
];

export default function SearchPanel({
  visible,
  onClose,
  onSearch,
}: Readonly<SearchPanelProps>) {
  const [locationType, setLocationType] = useState<LocationType>("building");
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteIdx, setAutocompleteIdx] = useState(-1);
  const { buildings } = useBuildingData();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-40)).current;

  // Animate in/out
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -40,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      // Reset state when closing
      setDropdownOpen(false);
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  const selectedLabel =
    LOCATION_OPTIONS.find((o) => o.key === locationType)?.label ?? "";

  const placeholderText =
    locationType === "building" ? "Building name" : "Restaurant name";

  const handleSelect = (key: LocationType) => {
    setLocationType(key);
    setDropdownOpen(false);
    setQuery("");
    setShowAutocomplete(false);
  };

  const handleSearch = () => {
    setShowAutocomplete(false);
    onSearch(query.trim(), locationType);
  };

  // Autocomplete logic
  let autocompleteResults: { buildingName: string; buildingCode: string; buildingLongName: string }[] = [];
  if (locationType === "building" && query.trim().length > 0) {
    const q = query.trim().toLowerCase();
    const isPrefixMatch = (field: string) => {
      // Split on non-word boundaries, check if any word starts with q
      return field
        .toLowerCase()
        .split(/\W+/)
        .some((word) => word.startsWith(q));
    };
    autocompleteResults = buildings.filter((b) => {
      const gpi = (b as any).Google_Place_Info || {};
      const displayName = gpi.displayName?.text || "";
      const formattedAddress = gpi.formattedAddress || "";
      return (
        isPrefixMatch(b.buildingName) ||
        isPrefixMatch(b.buildingLongName) ||
        isPrefixMatch(b.buildingCode) ||
        isPrefixMatch(displayName) ||
        isPrefixMatch(formattedAddress) ||
        isPrefixMatch(b.address)
      );
    });
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
      accessibilityRole="search"
      pointerEvents="auto"
    >
      {/* Location type dropdown */}
      <Text style={styles.label}>Location type</Text>
      <View style={styles.dropdownMenuWrapper}>
        <Pressable
          style={styles.dropdownTrigger}
          onPress={() => setDropdownOpen((prev) => !prev)}
          accessibilityLabel="Select location type"
          accessibilityRole="button"
        >
          <Text style={styles.dropdownTriggerText}>{selectedLabel}</Text>
          <FontAwesome5
            name={dropdownOpen ? "chevron-up" : "chevron-down"}
            size={12}
            color="#666"
          />
        </Pressable>

        {dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {LOCATION_OPTIONS.map((option, idx) => (
              <React.Fragment key={option.key}>
                {idx > 0 && <View style={styles.dropdownDivider} />}
                <Pressable
                  style={[
                    styles.dropdownOption,
                    option.key === locationType &&
                    styles.dropdownOptionSelected,
                  ]}
                  onPress={() => handleSelect(option.key)}
                  accessibilityLabel={option.label}
                  accessibilityRole="menuitem"
                >
                  <Text style={styles.dropdownOptionText}>
                    {option.label}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>

      {/* Search text input */}
      <View style={styles.textInputWrapper}>
        <TextInput
          style={styles.textInputInner}
          placeholder={placeholderText}
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setDropdownOpen(false);
            setShowAutocomplete(true);
            setAutocompleteIdx(-1);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          accessibilityLabel={`Search ${placeholderText.toLowerCase()}`}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
          onFocus={() => setShowAutocomplete(true)}
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery("");
              setShowAutocomplete(false);
            }}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Autocomplete results */}
      {showAutocomplete && autocompleteResults.length > 0 && (
        <ScrollView
          style={styles.autocompleteList}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {autocompleteResults.slice(0, 8).map((b, idx) => (
            <Pressable
              key={b.buildingCode + b.buildingLongName}
              style={[
                styles.dropdownOption,
                idx === autocompleteIdx && styles.dropdownOptionSelected,
              ]}
              onPress={() => {
                setQuery(b.buildingLongName);
                setShowAutocomplete(false);
              }}
              accessibilityLabel={b.buildingLongName}
              accessibilityRole="menuitem"
            >
              <Text style={styles.dropdownOptionText}>{b.buildingLongName}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Search button */}
      <Pressable
        style={styles.searchActionButton}
        onPress={handleSearch}
        accessibilityLabel="Search"
        accessibilityRole="button"
      >
        <Text style={styles.searchActionButtonText}>Search</Text>
      </Pressable>
    </Animated.View>
  );
}
