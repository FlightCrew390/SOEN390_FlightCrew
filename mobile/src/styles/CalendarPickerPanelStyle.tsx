import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    zIndex: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  panel: {
    width: "88%",
    maxHeight: "75%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },

  /* ── Top section: maroon header ── */
  headerSection: {
    backgroundColor: COLORS.concordiaMaroon,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },

  /* ── Calendar list ── */
  listSection: {
    paddingTop: 12,
    paddingBottom: 8,
    maxHeight: 320,
  },
  calendarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  calendarRowSelected: {
    backgroundColor: "rgba(156, 45, 45, 0.08)",
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  calendarInfo: {
    flex: 1,
  },
  calendarName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  calendarDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  primaryBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.concordiaMaroon,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: COLORS.concordiaMaroon,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.concordiaMaroon,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 20,
  },

  /* ── Loading ── */
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  /* ── Bottom actions ── */
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.concordiaMaroon,
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  skipButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    marginTop: 6,
  },
  skipButtonText: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textSecondary,
    textDecorationLine: "underline",
  },
});

export default styles;
