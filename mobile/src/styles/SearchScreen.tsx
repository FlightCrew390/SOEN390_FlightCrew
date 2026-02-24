import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
  },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  message: {
    padding: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  error: {
    padding: 16,
    fontSize: 14,
    color: COLORS.error,
  },
});

export default styles;
