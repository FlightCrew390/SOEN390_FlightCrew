import { ViewStyle, TextStyle } from "react-native";
import { COLORS } from "../constants";

const NAVBAR_GRAY = "#d0d0d0";

export const CommonStyles = {
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
  } as ViewStyle,

  modalPanel: {
    width: "88%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: "hidden",
  } as ViewStyle,

  bottomPanelContainer: {
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
  } as ViewStyle,

  bottomPanelHeader: {
    backgroundColor: NAVBAR_GRAY,
    paddingTop: 72,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,

  backButton: {
    marginRight: 12,
    padding: 4,
  } as ViewStyle,

  headerContent: {
    flex: 1,
    marginRight: 12,
  } as ViewStyle,

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 2,
  } as TextStyle,

  /* Form Elements */
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  } as ViewStyle,

  textInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b0b0b0",
    marginBottom: 12,
    paddingRight: 4,
  } as ViewStyle,

  searchActionButton: {
    backgroundColor: COLORS.concordiaMaroon,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,

  searchActionButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  } as TextStyle,
};
