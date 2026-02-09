import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 60,
    backgroundColor: "rgba(201, 45, 45, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  infoText: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "300",
    fontFamily: "Inter",
  },
  campusText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Inter",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.50)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  chevron: {
    shadowColor: "black",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  chevronLeft: {
    position: "absolute",
    left: 40,
    top: 15,
  },
  chevronRight: {
    position: "absolute",
    right: 40,
    top: 15,
  },
  chevronDisabled: {
    opacity: 0.3,
  },
});

export default styles;
