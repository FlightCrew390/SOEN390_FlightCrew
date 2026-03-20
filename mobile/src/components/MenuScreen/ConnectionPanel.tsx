import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { COLORS } from "../../constants";
import { useCalendar } from "../../contexts/CalendarContext";
import { useUser } from "../../contexts/UserContext";
import styles from "../../styles/ConnectionPanelStyle";
import CalendarPickerPanel from "./CalendarPickerPanel";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "";
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "";

const clientId = Platform.OS === "ios" ? IOS_CLIENT_ID : WEB_CLIENT_ID;

function getReversedClientId(iosClientId: string): string {
  const parts = iosClientId.split(".").reverse();
  return parts.join(".");
}

const redirectUri =
  Platform.OS === "ios"
    ? `${getReversedClientId(IOS_CLIENT_ID)}:/oauthredirect`
    : `com.soen390.flightcrew:/oauthredirect`;

type ActiveFlow = "none" | "signin" | "calendar";

export default function ConnectionPanel() {
  const {
    user,
    isAuthenticated,
    loading,
    error,
    signIn,
    signOut,
    savePreference,
  } = useUser();
  const [studentId, setStudentId] = useState<string>(user?.studentId ?? "");
  const [isEditing, setIsEditing] = useState(false);
  const {
    isConnected: isCalendarConnected,
    loading: calendarLoading,
    error: calendarError,
    connectCalendar,
    disconnectCalendar,
    // Calendar picker
    calendarList,
    calendarListLoading,
    selectedCalendarId,
    showCalendarPicker,
    confirmCalendarSelection,
    dismissCalendarPicker,
  } = useCalendar();
  const activeFlow = useRef<ActiveFlow>("none");

  useEffect(() => {
    if (!isEditing && user?.studentId !== undefined) {
      setStudentId(user.studentId ?? "");
    }
  }, [user?.studentId, isEditing]);

  const [signInRequest, signInResponse, signInPrompt] = useAuthRequest(
    {
      clientId,
      scopes: ["openid", "profile", "email"],
      responseType: "code",
      redirectUri,
      usePKCE: false,
    },
    GOOGLE_AUTH_DISCOVERY,
  );

  const [calendarRequest, calendarResponse, calendarPrompt] = useAuthRequest(
    {
      clientId,
      scopes: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/calendar.events.readonly",
      ],
      responseType: "code",
      redirectUri,
      usePKCE: false,
      extraParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
    GOOGLE_AUTH_DISCOVERY,
  );

  useEffect(() => {
    if (
      activeFlow.current === "signin" &&
      signInResponse?.type === "success" &&
      signInResponse.params?.code
    ) {
      activeFlow.current = "none";
      signIn(signInResponse.params.code, redirectUri, clientId);
    }
  }, [signInResponse, signIn]);

  useEffect(() => {
    if (
      activeFlow.current === "calendar" &&
      calendarResponse?.type === "success" &&
      calendarResponse.params?.code
    ) {
      activeFlow.current = "none";
      connectCalendar(calendarResponse.params.code, redirectUri, clientId);
    }
  }, [calendarResponse, connectCalendar]);

  const handleSignIn = () => {
    activeFlow.current = "signin";
    signInPrompt();
  };

  const handleCalendarConnect = () => {
    activeFlow.current = "calendar";
    calendarPrompt();
  };

  if (loading) {
    return (
      <View style={styles.container} testID="connection-panel-loading">
        <View style={styles.panel}>
          <View style={styles.loadingRow}>
            <ActivityIndicator size="large" color={COLORS.concordiaMaroon} />
            <Text style={styles.loadingText}>Restoring session…</Text>
          </View>
        </View>
      </View>
    );
  }

  const displayError = error || calendarError;

  return (
    <View style={styles.container} testID="connection-panel">
      <View style={styles.panel}>
        {isAuthenticated && user ? (
          <>
            <View style={styles.profile}>
              <View style={styles.profilePicture}>
                {user.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={styles.avatar}
                    accessibilityLabel={`${user.displayName}'s profile picture`}
                  />
                ) : (
                  <MaterialIcons name="person-outline" size={64} color="#888" />
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.studentName}>{user.displayName}</Text>
                <TextInput
                  style={styles.studentId}
                  value={studentId}
                  placeholder="Tap to enter studentID"
                  onChangeText={setStudentId}
                  onFocus={() => setIsEditing(true)}
                  onBlur={() => {
                    setIsEditing(false);
                    if (studentId !== user.studentId) {
                      savePreference({ studentId });
                    }
                  }}
                  onSubmitEditing={() => {
                    setIsEditing(false);
                    if (studentId !== user.studentId) {
                      savePreference({ studentId });
                    }
                  }}
                  accessibilityLabel="Student ID"
                  keyboardType="default"
                />
              </View>
            </View>

            {displayError != null && (
              <View style={styles.errorRow}>
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            <View style={styles.calendarGuide}>
              <Feather name="info" size={16} color="grey" />
              <Text style={styles.calendarGuideText}>
                Need help importing your schedule to Google Calendar?{" "}
                <Pressable
                  onPress={() => {
                    // Open the guide in the user's browser
                    const guideUrl =
                      "https://github.com/Tsounguinzo/visual-schedule-builder-export";
                    WebBrowser.openBrowserAsync(guideUrl);
                  }}
                >
                  <Text style={styles.calendarGuideLink}>Tap here</Text>
                </Pressable>{" "}
                for a guide.
              </Text>
            </View>

            {isCalendarConnected ? (
              <View style={styles.calendarConnected}>
                <FontAwesome6 name="google" size={24} color="green" />
                <Text style={styles.calendarConnectedText}>
                  Google Calendar connected
                </Text>
                <Pressable
                  onPress={disconnectCalendar}
                  accessibilityLabel="Disconnect Google Calendar"
                  accessibilityRole="button"
                >
                  <MaterialIcons name="link-off" size={24} color="grey" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[
                  styles.calendarConnection,
                  (!calendarRequest || calendarLoading) &&
                    styles.calendarConnectionDisabled,
                ]}
                onPress={handleCalendarConnect}
                disabled={!calendarRequest || calendarLoading}
                accessibilityLabel="Connect to Google Calendar"
                accessibilityRole="button"
              >
                {calendarLoading ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.concordiaMaroon}
                  />
                ) : (
                  <FontAwesome6 name="google" size={24} color="black" />
                )}
                <Text style={styles.calendarText}>
                  Connect to Google Calendar
                </Text>
                <Feather name="external-link" size={24} color="grey" />
              </Pressable>
            )}

            <Pressable
              style={styles.signOutButton}
              onPress={async () => {
                await disconnectCalendar();
                await signOut();
              }}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <MaterialIcons name="logout" size={20} color={COLORS.white} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            {displayError != null && (
              <View style={styles.errorRow}>
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}
            <Pressable
              style={[
                styles.signInButton,
                !signInRequest && styles.signInButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={!signInRequest}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
            >
              <FontAwesome6 name="google" size={20} color={COLORS.white} />
              <Text style={styles.signInText}>Sign In with Google</Text>
            </Pressable>
          </>
        )}
      </View>

      {/* Calendar picker popup — shown after Google Calendar is connected */}
      <CalendarPickerPanel
        visible={showCalendarPicker}
        calendars={calendarList}
        loading={calendarListLoading}
        preSelectedId={selectedCalendarId}
        onConfirm={confirmCalendarSelection}
        onDismiss={dismissCalendarPicker}
      />
    </View>
  );
}
