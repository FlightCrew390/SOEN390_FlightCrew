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
import { useAutocomplete } from "../../hooks/useAutocomplete";
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

function LocationTypeDropdown({
  selectedLabel,
  isOpen,
  locationType,
  onToggle,
  onSelect,
}: Readonly<{
  selectedLabel: string;
  isOpen: boolean;
  locationType: LocationType;
  onToggle: () => void;
  onSelect: (type: LocationType) => void;
}>) {
  return (
    <View style={styles.dropdownMenuWrapper}>
      <Pressable
        style={[styles.dropdownTrigger, isOpen && styles.dropdownTriggerOpen]}
        onPress={onToggle}
        accessibilityLabel="Select location type"
        accessibilityRole="button"
      >
        <Text style={styles.dropdownTriggerText}>{selectedLabel}</Text>
        <FontAwesome5
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={12}
          color="#666"
        />
      </Pressable>

      {isOpen && (
        <View style={styles.dropdownMenu}>
          {LOCATION_OPTIONS.map((option, idx) => (
            <React.Fragment key={option.key}>
              {idx > 0 && <View style={styles.dropdownDivider} />}
              <Pressable
                style={[
                  styles.dropdownOption,
                  option.key === locationType && styles.dropdownOptionSelected,
                ]}
                onPress={() => onSelect(option.key)}
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
  );
}

function AutocompleteList({
  results,
  activeIdx,
  onSelect,
}: Readonly<{
  results: Building[];
  activeIdx: number;
  onSelect: (building: Building) => void;
}>) {
  return (
    <ScrollView
      style={styles.autocompleteList}
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
    >
      {results.length === 0 ? (
        <View style={styles.dropdownOption}>
          <Text style={styles.noResultsText}>No buildings found.</Text>
        </View>
      ) : (
        results.slice(0, 8).map((b, idx) => (
          <Pressable
            key={b.buildingCode + b.buildingLongName}
            style={[
              styles.dropdownOption,
              idx === activeIdx && styles.dropdownOptionSelected,
            ]}
            onPress={() => onSelect(b)}
            accessibilityLabel={b.buildingLongName}
            accessibilityRole="menuitem"
          >
            <Text style={styles.dropdownOptionText}>{b.buildingLongName}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

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

  const autocompleteResults = useAutocomplete(
    buildings,
    state.query,
    state.locationType,
  );

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

  const showAutocompleteList =
    state.showAutocomplete &&
    state.locationType === "building" &&
    state.query.trim().length > 0;

  const isSearchDisabled =
    state.query.trim().length === 0 ||
    (state.locationType === "building" &&
      autocompleteResults.length === 0 &&
      !state.selectedResult);

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      testID="search-panel"
      accessibilityRole="search"
      pointerEvents={visible ? "auto" : "none"}
    >
      {/* Location type dropdown */}
      <Text style={styles.label}>Location type</Text>
      <LocationTypeDropdown
        selectedLabel={selectedLabel}
        isOpen={state.dropdownOpen}
        locationType={state.locationType}
        onToggle={() => dispatch({ type: "TOGGLE_DROPDOWN" })}
        onSelect={(type) =>
          dispatch({ type: "SELECT_LOCATION_TYPE", locationType: type })
        }
      />

      {/* Search text input */}
      <View
        style={[
          styles.textInputWrapper,
          showAutocompleteList && styles.textInputWrapperOpen,
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
      {showAutocompleteList && (
        <AutocompleteList
          results={autocompleteResults}
          activeIdx={state.autocompleteIdx}
          onSelect={(building) =>
            dispatch({
              type: "SELECT_AUTOCOMPLETE",
              building,
            })
          }
        />
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
