import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const NAVBAR_GRAY = "#d0d0d0";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 450,
    zIndex: 102,
    elevation: 102,
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    backgroundColor: NAVBAR_GRAY,
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  buildingName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
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
});

export default styles;
