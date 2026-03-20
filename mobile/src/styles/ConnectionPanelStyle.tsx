import { StyleSheet } from "react-native";
import { COLORS } from "../constants";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  panel: {
    width: "100%",
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 80,
    marginHorizontal: 20,
    marginBottom: 40,
  },

  /* Loading */
  loadingRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  /* Error */
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 0, 0, 0.08)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
    flex: 1,
  },

  /* Profile */
  profile: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileInfo: {
    gap: 5,
    marginTop: 10,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.textPrimary,
  },
  studentId: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  /* Calendar connection */
  calendarConnection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#eee",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarConnectionDisabled: {
    opacity: 0.4,
  },
  calendarText: {
    fontSize: 16,
    color: COLORS.concordiaMaroon,
    fontStyle: "italic",
    textDecorationLine: "underline",
    flex: 1,
    marginHorizontal: 12,
  },
  calendarConnected: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 20,
    backgroundColor: "rgba(0, 128, 0, 0.08)",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  calendarConnectedText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: "500",
    flex: 1,
    marginHorizontal: 12,
  },
  calendarGuide: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  calendarGuideText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
    fontStyle: "italic",
  },
  calendarGuideLink: {
    fontSize: 13,
    color: COLORS.concordiaMaroon,
    textDecorationLine: "underline",
    fontStyle: "italic",
  },

  /* Sign in */
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.concordiaMaroon,
    padding: 15,
    borderRadius: 20,
    gap: 10,
  },
  signInButtonDisabled: {
    opacity: 0.4,
  },
  signInText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: "600",
  },

  /* Sign out */
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.textSecondary,
    padding: 12,
    borderRadius: 20,
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: "600",
  },
});

export default styles;
