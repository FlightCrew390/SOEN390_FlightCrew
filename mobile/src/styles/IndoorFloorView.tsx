import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#f0f0f0",
    zIndex: 20,
  },
  flexWrapper: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  safeAreaHeader: {
    backgroundColor: "#e2e2e2",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 4,
    width: 36,
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: "center",
    marginTop: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 2,
    textAlign: "center",
  },
  headerSpacer: {
    width: 36,
  },
  floatButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  floorSelectorDropdown: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  floorOption: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  floorOptionText: {
    fontSize: 14,
    fontWeight: "700",
  },
  amenityDropdown: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  amenityOption: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  amenityExpandToggle: {
    width: 60,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  outdoorToggleButton: {
    position: "absolute",
    bottom: 24,
    right: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedOption: {
    backgroundColor: COLORS.concordiaMaroon,
  },
  unselectedOption: {
    backgroundColor: "transparent",
  },
});

export default styles;
