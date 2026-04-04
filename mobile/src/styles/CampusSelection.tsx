import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    paddingTop: 0,
    paddingBottom: 16,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  infoText: {
    color: "#6E1717",
    fontSize: 17,
    textAlign: "center",
    fontWeight: "300",
    fontFamily: "Inter",
    marginBottom: 10,
    textShadowColor: "rgba(255, 255, 255, 0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  toggleContainer: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(139, 32, 32, 0.7)",
    shadowColor: "#8b2020",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  toggleOption: {
    flex: 1,
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  toggleOptionActive: {
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    shadowColor: "#6E1717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleLabel: {
    color: "rgba(255, 255, 255, 0.88)",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  toggleLabelActive: {
    color: "#8b2020",
  },
});

export default styles;
