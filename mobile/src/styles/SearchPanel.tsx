import { StyleSheet } from "react-native";
import { COLORS } from "../constants";
import { CommonStyles } from "./CommonStyles";

const styles = StyleSheet.create({
  overlay: {
    ...CommonStyles.overlay,
    zIndex: 9,
  },
  container: {
    ...CommonStyles.bottomPanelContainer,
    backgroundColor: "#d0d0d0", // NAVBAR_GRAY
    paddingTop: 112, // status-bar(48) + icon(56) + gap(8)
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 6,
    zIndex: 10,
    bottom: undefined,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  /* Dropdown trigger */
  dropdownTrigger: {
    ...CommonStyles.dropdownTrigger,
  },
  dropdownTriggerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },

  /* Dropdown menu */
  dropdownMenu: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#b0b0b0",
    marginBottom: 10,
    overflow: "hidden",
  },
  dropdownMenuWrapper: {},
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: "#e8e8e8",
  },
  dropdownOptionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: "#d0d0d0",
  },
  noResultsText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },

  /* Text input */
  textInputWrapper: {
    ...CommonStyles.textInputWrapper,
  },
  textInputWrapperOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  textInputInner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  clearButton: {
    padding: 6,
    marginRight: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 18,
    color: "#666",
    fontWeight: "600",
  },

  /* Autocomplete results list (connected to input) */
  autocompleteList: {
    maxHeight: 180,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: "#b0b0b0",
    marginBottom: 12,
  },

  /* Search action button */
  searchActionButton: {
    ...CommonStyles.searchActionButton,
  },
  searchActionButtonDisabled: {
    opacity: 0.4,
  },
  searchActionButtonText: {
    ...CommonStyles.searchActionButtonText,
  },
});

export default styles;
