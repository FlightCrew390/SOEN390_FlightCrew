import { StyleSheet } from "react-native";
import { COLORS } from "../constants";
import { CommonStyles } from "./CommonStyles";

const styles = StyleSheet.create({
  container: {
    ...CommonStyles.bottomPanelContainer,
  },
  header: {
    ...CommonStyles.bottomPanelHeader,
  },
  backButton: {
    ...CommonStyles.backButton,
  },
  headerContent: {
    ...CommonStyles.headerContent,
  },
  buildingName: {
    ...CommonStyles.headerTitle,
  },
  buildingAddress: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  distanceText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  stepScroll: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 20,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 7,
    paddingHorizontal: 16,
    marginRight: 10,
    gap: 12,
  },
  stepRowOdd: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 7,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: "#F4F4F4",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  stepMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  startBuildingIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.concordiaMaroon,
  },

  /* ── Time summary bar ── */
  timeSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  timeSummaryItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timeSummaryLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  timeSummaryValue: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "700",
  },
  timeSummaryDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#D0D0D0",
  },

  /* ── Step timestamp ── */
  stepTimestamp: {
    fontSize: 12,
    color: COLORS.concordiaMaroon,
    fontWeight: "600",
    marginBottom: 2,
  },

  /* ── Transit badge ── */
  transitBadge: {
    marginTop: 6,
    backgroundColor: "#2D5F8A",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 3,
  },
  transitLineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transitLineName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.white,
  },
  transitStop: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
  },
  transitStopCount: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontStyle: "italic",
  },
});

export default styles;
