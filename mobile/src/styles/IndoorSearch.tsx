import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const PANEL_GRAY = "#d0d0d0";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  panel: {
    backgroundColor: PANEL_GRAY,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  /* Labels */
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },

  /* Dropdown trigger */
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
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
    maxHeight: 160,
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
    backgroundColor: PANEL_GRAY,
  },

  /* Text input */
  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    marginBottom: 12,
    paddingRight: 4,
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

  /* Search button */
  searchActionButton: {
    backgroundColor: COLORS.concordiaMaroon,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  searchActionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  /* Results list */
  resultListContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: COLORS.white,
  },
  resultRowOdd: {
    backgroundColor: "#F4F4F4",
  },
  resultContent: {
    flex: 1,
  },
  roomLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  buildingName: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Empty state */
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
});

export default styles;
