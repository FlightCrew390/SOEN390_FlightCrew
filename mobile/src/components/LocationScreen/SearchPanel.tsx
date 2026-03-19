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
import { IndoorDataService } from "../../services/IndoorDataService";
import { LOCATION_OPTIONS, RADIUS_OPTIONS } from "../../constants/searchPanel";
import { LocationType, isClassroom, isPoi } from "../../state/SearchPanelState";
import styles from "../../styles/SearchPanel";
import { Building } from "../../types/Building";

const CLASSROOM_BUILDINGS = [
  { id: null, label: "All Buildings" },
  ...IndoorDataService.getAvailableBuildings().map((id) => ({ id, label: id })),
];

const BUILDING_NAMES: Record<string, string> = {
  Hall: "Henry F. Hall (H) Building",
  CC: "CC Building",
  MB: "John Molson School of Business",
  VE: "Vanier Extension (VE)",
  VL: "Vanier Library (VL)",
};

interface SearchPanelProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSearch: (
    query: string,
    locationType: LocationType,
    radiusKm: number | null,
    classroomBuildingId?: string | null,
  ) => void;
  readonly onSelectBuilding: (building: Building) => void;
}

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

function RadiusDropdown({
  selectedLabel,
  isOpen,
  radiusKm,
  onToggle,
  onSelect,
}: Readonly<{
  selectedLabel: string;
  isOpen: boolean;
  radiusKm: number | null;
  onToggle: () => void;
  onSelect: (value: number | null) => void;
}>) {
  return (
    <View style={styles.dropdownMenuWrapper}>
      <Pressable
        style={[styles.dropdownTrigger, isOpen && styles.dropdownTriggerOpen]}
        onPress={onToggle}
        accessibilityLabel="Select distance radius"
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
          {RADIUS_OPTIONS.map((option, idx) => (
            <React.Fragment key={option.label}>
              {idx > 0 && <View style={styles.dropdownDivider} />}
              <Pressable
                style={[
                  styles.dropdownOption,
                  option.value === radiusKm && styles.dropdownOptionSelected,
                ]}
                onPress={() => onSelect(option.value)}
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

  const isPoiType = isPoi(state.locationType);
  const isClassroomType = isClassroom(state.locationType);

  const radiusLabel =
    RADIUS_OPTIONS.find((o) => o.value === state.radiusKm)?.label ?? "No limit";

  const placeholderText =
    state.locationType === "building"
      ? "Building name"
      : isClassroomType
        ? "Classroom name..."
        : "Location name";

  const classroomBuildingLabel = state.classroomBuildingId
    ? (BUILDING_NAMES[state.classroomBuildingId] ?? state.classroomBuildingId)
    : "All Buildings";

  const handleSearch = () => {
    dispatch({ type: "BLUR_INPUT" });
    if (isClassroomType) {
      onSearch(
        state.query.trim(),
        state.locationType,
        null,
        state.classroomBuildingId,
      );
    } else if (isPoiType) {
      onSearch("", state.locationType, state.radiusKm);
    } else if (state.selectedResult) {
      onSelectBuilding(state.selectedResult);
    } else {
      onSearch(state.query.trim(), state.locationType, state.radiusKm);
    }
  };

  const showAutocompleteList =
    state.showAutocomplete &&
    state.locationType === "building" &&
    state.query.trim().length > 0;

  const isSearchDisabled =
    isPoiType || isClassroomType
      ? false
      : state.query.trim().length === 0 ||
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

      {/* Classroom: building filter + room name input */}
      {isClassroomType ? (
        <>
          <Text style={styles.label}>Building</Text>
          <View style={styles.dropdownMenuWrapper}>
            <Pressable
              style={[
                styles.dropdownTrigger,
                state.classroomBuildingDropdownOpen &&
                  styles.dropdownTriggerOpen,
              ]}
              onPress={() =>
                dispatch({ type: "TOGGLE_CLASSROOM_BUILDING_DROPDOWN" })
              }
              accessibilityLabel="Select building"
              accessibilityRole="button"
            >
              <Text style={styles.dropdownTriggerText}>
                {classroomBuildingLabel}
              </Text>
              <FontAwesome5
                name={
                  state.classroomBuildingDropdownOpen
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={12}
                color="#666"
              />
            </Pressable>
            {state.classroomBuildingDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {CLASSROOM_BUILDINGS.map((b, idx) => (
                  <React.Fragment key={b.label}>
                    {idx > 0 && <View style={styles.dropdownDivider} />}
                    <Pressable
                      style={[
                        styles.dropdownOption,
                        b.id === state.classroomBuildingId &&
                          styles.dropdownOptionSelected,
                      ]}
                      onPress={() =>
                        dispatch({
                          type: "SELECT_CLASSROOM_BUILDING",
                          buildingId: b.id,
                        })
                      }
                      accessibilityLabel={b.label}
                      accessibilityRole="menuitem"
                    >
                      <Text style={styles.dropdownOptionText}>
                        {b.id
                          ? (BUILDING_NAMES[b.id] ?? b.id)
                          : "All Buildings"}
                      </Text>
                    </Pressable>
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>

          <View style={styles.textInputWrapper}>
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
              accessibilityLabel="Search classroom name"
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
        </>
      ) : isPoiType ? (
        <>
          <Text style={styles.label}>Distance from location</Text>
          <RadiusDropdown
            selectedLabel={radiusLabel}
            isOpen={state.radiusDropdownOpen}
            radiusKm={state.radiusKm}
            onToggle={() => dispatch({ type: "TOGGLE_RADIUS_DROPDOWN" })}
            onSelect={(value) =>
              dispatch({ type: "SELECT_RADIUS", radiusKm: value })
            }
          />
        </>
      ) : (
        <>
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
              onBlur={() =>
                setTimeout(() => dispatch({ type: "BLUR_INPUT" }), 200)
              }
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
        </>
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
