import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Platform } from "react-native";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { acceptAuthUrl } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
export default function AuthCallback() {
  const router = useRouter();
  const { colors } = useTheme();
  const url = Linking.useURL();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const value =
          Platform.OS === "web"
            ? window.location.href
            : url || (await Linking.getInitialURL());
        const type = value ? await acceptAuthUrl(value) : null;
        if (!type)
          throw new Error(
            "This sign-in link is incomplete. Please request a new link.",
          );
        if (active)
          router.replace(
            type === "recovery"
              ? ("/reset-password?recovery=1" as any)
              : "/app",
          );
      } catch (e: any) {
        if (active) setError(e.message);
      }
    })();
    return () => {
      active = false;
    };
  }, [url, router]);
  return (
    <View
      style={{
        flex: 1,
        padding: 32,
        gap: 20,
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
    >
      {error ? (
        <>
          <Text style={{ color: colors.destructive }}>{error}</Text>
          <Pressable onPress={() => router.replace("/sign-in")}>
            <Text style={{ color: colors.primary }}>Back to sign in</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.primary} />
          <Text style={{ color: colors.foreground, textAlign: "center" }}>
            Completing sign in…
          </Text>
        </>
      )}
    </View>
  );
}
