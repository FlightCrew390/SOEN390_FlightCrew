import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    alignSelf: "flex-start",
    padding: 8,
    marginBottom: 8,
  },
  backArrow: {
    fontSize: 24,
    color: COLORS.concordiaMaroon,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  poiName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    flex: 1,
  },
  distance: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  address: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  startingPointSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  startingPointLabel: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  startingPointValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  startingPointHint: {
    fontSize: 14,
    color: COLORS.textTertiary,
    fontStyle: "italic",
  },
  startingPointActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  startingPointButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  startingPointButtonText: {
    fontSize: 13,
    color: COLORS.concordiaMaroon,
    fontWeight: "500",
  },
  originModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  originModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
    paddingBottom: 24,
  },
  originModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  originModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  originModalClose: {
    fontSize: 22,
    color: COLORS.textSecondary,
    padding: 4,
  },
  originModalCurrentRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.concordiaMaroonLight,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  originModalCurrentLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.concordiaMaroon,
  },
  originModalCurrentBuilding: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  originSearchInput: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  originBuildingRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  originBuildingName: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  originBuildingAddress: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  originEmpty: {
    fontSize: 14,
    color: COLORS.textTertiary,
    padding: 16,
    textAlign: "center",
  },
  travelModeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonSelected: {
    backgroundColor: COLORS.concordiaMaroonLight,
  },
  modeIcon: {
    fontSize: 22,
  },
  miscInfo: {
    maxHeight: 120,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  miscInfoContent: {
    padding: 16,
  },
  miscText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mapContainer: {
    flex: 1,
    minHeight: 250,
  },
  map: {
    flex: 1,
    width: "100%",
  },
  stepsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: COLORS.overlayWhite,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 12,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.concordiaMaroon,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  routeError: {
    fontSize: 12,
    color: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
});

export default styles;
