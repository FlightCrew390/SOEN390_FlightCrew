import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import styles from "../../styles/SearchPanel";

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
  };

  const handleSearch = () => {
    onSearch(query.trim(), locationType);
  };

  return (
    <>
      {/* Transparent backdrop to close dropdown if tapped outside */}
      <Pressable
        style={styles.overlay}
        onPress={onClose}
        accessibilityLabel="Close search"
      />

      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
        accessibilityRole="search"
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
        <TextInput
          style={styles.textInput}
          placeholder={placeholderText}
          placeholderTextColor="#999"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setDropdownOpen(false);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          accessibilityLabel={`Search ${placeholderText.toLowerCase()}`}
        />

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
    </>
  );
}
