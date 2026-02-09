import { StyleSheet } from "react-native";
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
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  buildingLongName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
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
});
