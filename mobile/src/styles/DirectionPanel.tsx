import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const NAVBAR_GRAY = "#d0d0d0";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: "hidden",
    backgroundColor: COLORS.white,
  },
  header: {
    backgroundColor: NAVBAR_GRAY,
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buildingInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    paddingRight: 40, // extra room so text doesn't overlap close button
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  closeButton: {
    position: "absolute",
    top: 48,
    left: 12,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 101,
    elevation: 101,
  },
  body: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  buildingName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  searchButtonLeftOfAddress: {
    padding: 4,
  },
  buildingAddress: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
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
    paddingHorizontal: 16,
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
    marginHorizontal: 16,
    marginBottom: 12,
  },
  descriptionScroll: {
    maxHeight: 80,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  buildingLongName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
    lineHeight: 22,
  },
  buildingDetail: {
    fontSize: 13,
    color: "#5A5A5A",
    marginBottom: 6,
    lineHeight: 20,
  },
});

export default styles;
