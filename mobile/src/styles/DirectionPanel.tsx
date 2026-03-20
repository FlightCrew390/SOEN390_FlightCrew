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
    paddingRight: 40,
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
    marginBottom: 4,
    gap: 10,
  },
  searchButtonLeftOfAddress: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F2",
    alignItems: "center",
    justifyContent: "center",
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
  changeStartWrapper: {
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "column",
  },
  startRowWithShuttle: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  startRowLeft: {
    flex: 1,
    minWidth: 0,
  },
  changeStartRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 10,
    alignSelf: "flex-start",
  },
  changeStartText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  changeStart: {
    fontSize: 14,
    color: COLORS.concordiaMaroon,
    textDecorationLine: "underline",
    fontStyle: "italic",
  },
  resetStartRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 14,
    gap: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  resetStartText: {
    fontSize: 12,
    color: COLORS.concordiaMaroon,
    fontWeight: "500",
    fontStyle: "italic",
  },

  /* ── Transport options ── */
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
    paddingVertical: 8,
    borderRadius: 10,
    marginHorizontal: 3,
  },
  transportCardActive: {
    backgroundColor: "rgba(156, 45, 45, 0.10)",
  },
  transportIconWrap: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  transportIcon: {
    width: 44,
    height: 44,
    tintColor: "#6B6B6B",
  },
  transportIconActive: {
    tintColor: COLORS.concordiaMaroon,
  },
  transportTime: {
    fontSize: 11,
    color: "#4A4A4A",
    fontWeight: "500",
  },
  transportTimeActive: {
    color: COLORS.concordiaMaroon,
    fontWeight: "700",
  },
  transportCardDisabled: {
    opacity: 0.45,
  },
  transportIconDisabled: {
    tintColor: "#B0B0B0",
  },
  transportTimeDisabled: {
    color: "#B0B0B0",
  },

  /* ── Loading & error ── */
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  shuttleUnavailableText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    flex: 1,
  },

  /* ── Divider ── */
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  descriptionScroll: {
    maxHeight: 200,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  /* ── Step list (turn-by-turn) ── */
  viewStepsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.concordiaMaroon,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  viewStepsText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  /* ── Fallback building info ── */
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

  /* ── Departure time picker ── */
  departureWrapper: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  departureToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 8,
    alignSelf: "flex-start",
  },
  departureToggleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  departureToggleTime: {
    fontSize: 13,
    color: COLORS.concordiaMaroon,
    fontWeight: "600",
  },
  departureOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  departurePill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#F2F2F2",
  },
  departurePillActive: {
    backgroundColor: COLORS.concordiaMaroon,
  },
  departurePillText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  departurePillTextShortcut: {
    fontSize: 13,
    color: COLORS.concordiaMaroon,
    fontWeight: "500",
    fontStyle: "italic",
    opacity: 0.8,
    textDecorationLine: "underline",
  },
  departurePillTextActive: {
    color: COLORS.white,
  },
  departureDateTimeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  departureDateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F2F2F2",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  departureDateText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
  departurePastTimeWarning: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: "500",
  },
});

export default styles;
