import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { invoke } from "@/lib/api";
import { useTheme } from "@/hooks/useTheme";
export default function PaymentReturn() {
  const { reference, trxref } = useLocalSearchParams<{
    reference?: string;
    trxref?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [message, setMessage] = useState("Verifying your payment...");
  const [busy, setBusy] = useState(true);
  useEffect(() => {
    let active = true;
    const ref = reference || trxref;
    if (!ref) {
      setMessage(
        "No payment reference was returned. Check your subscription before trying again.",
      );
      setBusy(false);
      return;
    }
    invoke("paystack-verify-subscription", { reference: ref })
      .then(() => {
        if (active)
          setMessage("Payment verified. Your subscription is active.");
      })
      .catch((e) => {
        if (active) setMessage(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [reference, trxref]);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        padding: 24,
        gap: 20,
      }}
    >
      {busy && <ActivityIndicator color={colors.primary} />}
      <Text style={{ color: colors.foreground, fontSize: 20 }}>{message}</Text>
      {!busy && (
        <Pressable onPress={() => router.replace("/app/subscriptions" as any)}>
          <Text style={{ color: colors.primary }}>View subscriptions</Text>
        </Pressable>
      )}
    </View>
  );
}
