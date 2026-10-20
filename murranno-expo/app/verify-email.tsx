import { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/hooks/useTheme";
import { appRedirect } from "@/lib/auth";
export default function VerifyEmail() {
  const { colors } = useTheme();
  const router = useRouter();
  const { email: initial } = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(initial || "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
        gap: 16,
        maxWidth: 520,
        width: "100%",
        alignSelf: "center",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={{ fontSize: 30, fontWeight: "600", color: colors.foreground }}
      >
        Verify your email
      </Text>
      <Text style={{ color: colors.mutedForeground }}>
        Enter the code from your confirmation email.
      </Text>
      {[
        [email, setEmail, "Email"],
        [code, setCode, "Confirmation code"],
      ].map(([value, set, label]) => (
        <TextInput
          key={label as string}
          accessibilityLabel={label as string}
          value={value as string}
          onChangeText={set as (v: string) => void}
          placeholder={label as string}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          style={{
            minHeight: 48,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 12,
            color: colors.foreground,
          }}
        />
      ))}
      {!!error && <Text style={{ color: colors.destructive }}>{error}</Text>}
      {!!message && <Text style={{ color: colors.success }}>{message}</Text>}
      <Pressable
        disabled={busy}
        accessibilityRole="button"
        onPress={async () => {
          setBusy(true);
          setError("");
          try {
            const { error: e } = await supabase.auth.verifyOtp({
              email: email.trim(),
              token: code.trim(),
              type: "signup",
            });
            if (e) throw e;
            router.replace("/app");
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
        style={{
          backgroundColor: colors.primary,
          minHeight: 48,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
        }}
      >
        {busy ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={{ color: colors.onPrimary }}>Verify email</Text>
        )}
      </Pressable>
      <Pressable
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          try {
            const { error: e } = await supabase.auth.resend({
              type: "signup",
              email: email.trim(),
              options: { emailRedirectTo: appRedirect("auth/callback") },
            });
            if (e) throw e;
            setMessage("A new confirmation email has been requested.");
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        }}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text style={{ color: colors.primary }}>Resend code</Text>
      </Pressable>
    </ScrollView>
  );
}
