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
  headerTitle: {
    ...CommonStyles.headerTitle,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultScroll: {
    flex: 1,
  },
  resultScrollContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  resultRowOdd: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: "#F4F4F4",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
  },
  resultContent: {
    flex: 1,
  },
  poiName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    lineHeight: 20,
  },
  poiAddress: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  poiDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
    fontStyle: "italic",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    padding: 6,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.error,
    textAlign: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
});

export default styles;
