import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { makeRedirectUri, useAuthRequest } from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { COLORS } from "../../constants";
import { useUser } from "../../contexts/UserContext";
import styles from "../../styles/ConnectionPanelStyle";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_DISCOVERY = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const redirectUri = makeRedirectUri({
  scheme: "com.soen390.flightcrew",
  path: "redirect",
});

export default function ConnectionPanel() {
  const { user, isAuthenticated, loading, error, signIn, signOut } = useUser();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
      scopes: ["openid", "profile", "email"],
      responseType: "code",
      redirectUri,
      usePKCE: true,
    },
    GOOGLE_AUTH_DISCOVERY,
  );

  useEffect(() => {
    if (response?.type === "success" && response.params?.code) {
      signIn(response.params.code, redirectUri);
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
                <Text style={styles.studentId}>{user.id}</Text>
              </View>
            </View>

            <Pressable
              style={styles.calendarConnection}
              onPress={() => {
                // TODO: Launch Google Calendar OAuth consent flow
                // with additional scope "https://www.googleapis.com/auth/calendar.readonly"
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
