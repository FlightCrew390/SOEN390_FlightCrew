import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
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
import { useUser } from "../../contexts/UserContext";
import styles from "../../styles/ConnectionPanelStyle";

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

  useEffect(() => {
    if (!isEditing && user?.studentId !== undefined) {
      setStudentId(user.studentId ?? "");
    }
  }, [user?.studentId, isEditing]);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId,
      scopes: ["openid", "profile", "email"],
      responseType: "code",
      redirectUri,
      usePKCE: false,
    },
    GOOGLE_AUTH_DISCOVERY,
  );

  useEffect(() => {
    if (response?.type === "success" && response.params?.code) {
      signIn(response.params.code, redirectUri, clientId);
    }
  }, [response, signIn]);

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

            <Pressable
              style={styles.calendarConnection}
              onPress={() => {
                // TODO: Launch Google Calendar OAuth consent flow
              }}
              accessibilityLabel="Connect to Google Calendar"
              accessibilityRole="button"
            >
              <FontAwesome6 name="google" size={24} color="black" />
              <Text style={styles.calendarText}>
                Connect to Google Calendar
              </Text>
              <Feather name="external-link" size={24} color="grey" />
            </Pressable>

            <Pressable
              style={styles.signOutButton}
              onPress={signOut}
              accessibilityLabel="Sign out"
              accessibilityRole="button"
            >
              <MaterialIcons name="logout" size={20} color={COLORS.white} />
              <Text style={styles.signOutText}>Sign Out</Text>
            </Pressable>
          </>
        ) : (
          <>
            {error != null && (
              <View style={styles.errorRow}>
                <MaterialIcons
                  name="error-outline"
                  size={18}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Pressable
              style={[
                styles.signInButton,
                !request && styles.signInButtonDisabled,
              ]}
              onPress={() => promptAsync()}
              disabled={!request}
              accessibilityLabel="Sign in with Google"
              accessibilityRole="button"
            >
              <FontAwesome6 name="google" size={20} color={COLORS.white} />
              <Text style={styles.signInText}>Sign In with Google</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
