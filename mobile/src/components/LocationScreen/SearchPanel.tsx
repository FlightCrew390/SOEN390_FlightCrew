import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useEffect, useReducer } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useBuildings } from "../../contexts/BuildingContext";
import { usePanelAnimation } from "../../hooks/usePanelAnimation";
import {
  initialSearchPanelState,
  searchPanelReducer,
} from "../../reducers/searchPanelReducer";
import { LocationType } from "../../state/SearchPanelState";
import styles from "../../styles/SearchPanel";
import { Building } from "../../types/Building";

interface SearchPanelProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSearch: (query: string, locationType: LocationType) => void;
  readonly onSelectBuilding: (building: Building) => void;
}

const LOCATION_OPTIONS: { key: LocationType; label: string }[] = [
  { key: "building", label: "Campus Building" },
  { key: "restaurant", label: "Restaurant" },
];

export default function SearchPanel({
  visible,
  onClose,
  onSearch,
  onSelectBuilding,
}: Readonly<SearchPanelProps>) {
  const [state, dispatch] = useReducer(
    searchPanelReducer,
    initialSearchPanelState,
  );
  const { buildings } = useBuildings();
  const { animatedStyle } = usePanelAnimation(visible);

  useEffect(() => {
    if (!visible) dispatch({ type: "PANEL_CLOSED" });
  }, [visible]);

  const selectedLabel =
    LOCATION_OPTIONS.find((o) => o.key === state.locationType)?.label ?? "";

  const placeholderText =
    state.locationType === "building" ? "Building name" : "Restaurant name";

  const handleSearch = () => {
    dispatch({ type: "BLUR_INPUT" });
    if (state.selectedResult) {
      onSelectBuilding(state.selectedResult);
    } else {
      onSearch(state.query.trim(), state.locationType);
    }
  };

  let autocompleteResults: {
    buildingName: string;
    buildingCode: string;
    buildingLongName: string;
  }[] = [];
  if (state.locationType === "building" && state.query.trim().length > 0) {
    const q = state.query.trim().toLowerCase();
    const queryWords = q.split(/\s+/).filter((w) => w.length > 0);
    const isWordMatch = (field: string) => {
      const fieldWords = field.toLowerCase().split(/\W+/);
      return queryWords.every((qw) =>
        fieldWords.some((fw) => fw.startsWith(qw)),
      );
    };
    autocompleteResults = buildings.filter((b) => {
      const gpi = (b as any).Google_Place_Info || {};
      const displayName = gpi.displayName?.text || "";
      const formattedAddress = gpi.formattedAddress || "";
      return (
        isWordMatch(b.buildingName) ||
        isWordMatch(b.buildingLongName) ||
        isWordMatch(b.buildingCode) ||
        isWordMatch(displayName) ||
        isWordMatch(formattedAddress) ||
        isWordMatch(b.address)
      );
    });
  }

  const isSearchDisabled =
    state.query.trim().length === 0 ||
    (state.locationType === "building" &&
      autocompleteResults.length === 0 &&
      !state.selectedResult);

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      accessibilityRole="search"
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Location type dropdown */}
      <Text style={styles.label}>Location type</Text>
      <View style={styles.dropdownMenuWrapper}>
        <Pressable
          style={[
            styles.dropdownTrigger,
            state.dropdownOpen && styles.dropdownTriggerOpen,
          ]}
          onPress={() => dispatch({ type: "TOGGLE_DROPDOWN" })}
          accessibilityLabel="Select location type"
          accessibilityRole="button"
        >
          <Text style={styles.dropdownTriggerText}>{selectedLabel}</Text>
          <FontAwesome5
            name={state.dropdownOpen ? "chevron-up" : "chevron-down"}
            size={12}
            color="#666"
          />
        </Pressable>

        {state.dropdownOpen && (
          <View style={styles.dropdownMenu}>
            {LOCATION_OPTIONS.map((option, idx) => (
              <React.Fragment key={option.key}>
                {idx > 0 && <View style={styles.dropdownDivider} />}
                <Pressable
                  style={[
                    styles.dropdownOption,
                    option.key === state.locationType &&
                      styles.dropdownOptionSelected,
                  ]}
                  onPress={() =>
                    dispatch({
                      type: "SELECT_LOCATION_TYPE",
                      locationType: option.key,
                    })
                  }
                  accessibilityLabel={option.label}
                  accessibilityRole="menuitem"
                >
                  <Text style={styles.dropdownOptionText}>{option.label}</Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        )}
      </View>

      {/* Search text input */}
      <View
        style={[
          styles.textInputWrapper,
          state.showAutocomplete &&
            state.locationType === "building" &&
            state.query.trim().length > 0 &&
            styles.textInputWrapperOpen,
        ]}
      >
        <TextInput
          style={styles.textInputInner}
          placeholder={placeholderText}
          placeholderTextColor="#999"
          value={state.query}
          onChangeText={(text) => dispatch({ type: "UPDATE_QUERY", text })}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          accessibilityLabel={`Search ${placeholderText.toLowerCase()}`}
          onBlur={() => setTimeout(() => dispatch({ type: "BLUR_INPUT" }), 200)}
          onFocus={() => dispatch({ type: "FOCUS_INPUT" })}
        />
        {state.query.length > 0 && (
          <Pressable
            onPress={() => dispatch({ type: "CLEAR_QUERY" })}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </Pressable>
        )}
      </View>

      {/* Autocomplete results */}
      {state.showAutocomplete &&
        state.locationType === "building" &&
        state.query.trim().length > 0 && (
          <ScrollView
            style={styles.autocompleteList}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            {autocompleteResults.length === 0 ? (
              <View style={styles.dropdownOption}>
                <Text style={styles.noResultsText}>No buildings found.</Text>
              </View>
            ) : (
              autocompleteResults.slice(0, 8).map((b, idx) => (
                <Pressable
                  key={b.buildingCode + b.buildingLongName}
                  style={[
                    styles.dropdownOption,
                    idx === state.autocompleteIdx &&
                      styles.dropdownOptionSelected,
                  ]}
                  onPress={() =>
                    dispatch({
                      type: "SELECT_AUTOCOMPLETE",
                      building: b as Building,
                    })
                  }
                  accessibilityLabel={b.buildingLongName}
                  accessibilityRole="menuitem"
                >
                  <Text style={styles.dropdownOptionText}>
                    {b.buildingLongName}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
        )}

      {/* Search button */}
      <Pressable
        style={[
          styles.searchActionButton,
          isSearchDisabled && styles.searchActionButtonDisabled,
        ]}
        onPress={handleSearch}
        disabled={isSearchDisabled}
        accessibilityLabel="Search"
        accessibilityRole="button"
      >
        <Text style={styles.searchActionButtonText}>Search</Text>
      </Pressable>
    </Animated.View>
  );
}
