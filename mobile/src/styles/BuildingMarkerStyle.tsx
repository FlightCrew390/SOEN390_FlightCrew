import { StyleSheet, Platform } from "react-native";
import { COLORS } from "../constants";

export const styles = StyleSheet.create({
  calloutContainer: {
    padding: 10,
    minWidth: 200,
  },
  buildingCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.concordiaMaroonLight,
    marginBottom: 4,
  },
  buildingName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  buildingLongName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
    lineHeight: 22,
  },
  address: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginBottom: 4,
  },
  campus: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.concordiaBlue,
    marginTop: 4,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 999,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 12,
    marginTop: Platform.OS === "android" ? 44 : 8,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 20,
    maxHeight: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 14,
    zIndex: 10,
    padding: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#9A9A9A",
    fontWeight: "600",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingRight: 24,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  buildingAddress: {
    fontSize: 13,
    color: "#7A7A7A",
    marginTop: 3,
    lineHeight: 18,
  },
  distanceText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  transportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  transportCard: {
    flex: 1,
    alignItems: "center",
    gap: 5,
  },
  transportIcon: {
    width: 44,
    height: 44,
    tintColor: "#6B6B6B",
  },
  transportTime: {
    fontSize: 11,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginBottom: 12,
  },
  descriptionScroll: {
    maxHeight: 80,
  },
  descriptionText: {
    fontSize: 13,
    color: "#3A3A3A",
    lineHeight: 20,
  },
  buildingDetail: {
    fontSize: 13,
    color: "#5A5A5A",
    marginBottom: 6,
    lineHeight: 20,
  },
});
