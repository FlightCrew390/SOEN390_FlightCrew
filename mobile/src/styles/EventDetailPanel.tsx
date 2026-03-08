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
    maxHeight: "80%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  },

  /* ── Top half: event info ── */
  infoSection: {
    backgroundColor: COLORS.concordiaMaroon,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: "flex-start",
    padding: 4,
    marginBottom: 8,
  },
  eventSummary: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    flex: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 10,
    lineHeight: 19,
  },

  /* ── Bottom half: actions ── */
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  alertRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  alertButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.concordiaMaroon,
    backgroundColor: COLORS.white,
  },
  alertButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.concordiaMaroon,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.concordiaMaroon,
  },
  directionsButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
});

export default styles;
