import { StyleSheet } from "react-native";
import { COLORS } from "../constants";
import { CommonStyles } from "./CommonStyles";

const styles = StyleSheet.create({
  overlay: {
    ...CommonStyles.overlay,
  },
  panel: {
    ...CommonStyles.modalPanel,
    maxHeight: "80%",
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
