import { appRedirect } from "@/lib/auth";
import { FormField } from "@/components/forms/FormField";
import { matches, password as passwordRule } from "@/lib/validation";
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  Pressable,
  Switch,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { ChevronRight, Sun, Moon, Monitor } from "lucide-react-native";
import { useRouter, useFocusEffect } from "expo-router";
import Constants from "expo-constants";
import { useTheme } from "@/hooks/useTheme";
import { useThemeContext, ThemeMode } from "@/contexts/ThemeContext";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { supabase } from "@/integrations/supabase/client";
import { invoke, changeCredentials, notify, confirmAction } from "@/lib/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { FormDialog } from "@/components/ui/FormDialog";
import { registerDevicePush } from "@/lib/push";

const NOTIFICATIONS = [
  { key: "email_notifications", label: "Email notifications" },
  { key: "push_notifications", label: "Push notifications" },
  { key: "in_app_notifications", label: "In-app notifications" },
  { key: "release_updates", label: "Release updates" },
  { key: "campaign_updates", label: "Campaign updates" },
  { key: "earnings_alerts", label: "Earnings alerts" },
  { key: "marketing_emails", label: "Marketing emails" },
];
export const Settings = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { themeMode, setThemeMode } = useThemeContext();
  const { subscriptions, refetch: refreshSubscriptions } = useSubscriptions();
  const [profile, setProfile] = useState<any>(null);
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [savingPreference, setSavingPreference] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [dialog, setDialog] = useState<
    "email" | "password" | "pin" | "security" | null
  >(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [p, n, c] = await Promise.all([
        invoke("get-profile"),
        invoke("get-notification-preferences"),
        invoke("get-mobile-config"),
      ]);
      setProfile(p.profile);
      setPrefs(n.preferences);
      setConfig(c);
    } catch (e: any) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      refresh();
      refreshSubscriptions();
    }, [refresh, refreshSubscriptions]),
  );
  const open = (kind: typeof dialog) => {
    setFields({});
    setError("");
    setDialog(kind);
  };
  const input = (
    name: string,
    label: string,
    secure = false,
    numeric = false,
  ) => (
    <FormField
      key={name}
      label={label}
      password={secure}
      value={fields[name] || ""}
      onChangeText={(v) => { setFields((f) => ({ ...f, [name]: numeric ? v.replace(/\D/g, "") : v })); setError(""); }}
      autoCapitalize="none"
      keyboardType={numeric ? "number-pad" : name === "email" ? "email-address" : "default"}
      maxLength={numeric ? 4 : undefined}
    />
  );
  const save = async () => {
    setError("");
    setBusy(true);
    try {
      if (dialog === "pin") {
        if (!/^\d{4}$/.test(fields.pin || ""))
          throw Error("Enter a 4-digit PIN.");
        if (fields.pin !== fields.confirm) throw Error("PINs must match.");
        await invoke("setup-transaction-pin", {
          pin: fields.pin,
          ...(profile?.transaction_pin_hash
            ? { current_pin: fields.current }
            : {}),
        });
      } else {
        if (!fields.current) throw Error("Enter your current password.");
        if (dialog === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email || ""))
            throw Error("Enter a valid email address.");
          await changeCredentials(
            { email: fields.email.trim(), current_password: fields.current },
            appRedirect("auth/callback"),
          );
        } else {
          const problem = passwordRule(fields.password || "") || matches(fields.password || "")(fields.confirm || "");
          if (problem) throw Error(problem);
          await changeCredentials({
            password: fields.password,
            current_password: fields.current,
          });
        }
      }
      setDialog(null);
      await refresh();
      notify(
        "Saved",
        dialog === "email"
          ? "Check your new email address for a confirmation link."
          : dialog === "pin"
            ? "Your transaction PIN has been saved."
            : "Your password has been updated.",
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (key: string, value: boolean) => {
    const previous = prefs[key];
    setSavingPreference(key);
    setPrefs((p) => ({ ...p, [key]: value }));
    try {
      if (key === "push_notifications" && value) {
        if (!config?.pushEnabled)
          throw Error(
            "Push delivery is not available yet. Other notification channels are available.",
          );
        await registerDevicePush(true);
      }
      const result = await invoke("update-notification-preferences", {
        [key]: value,
      });
      setPrefs(result.preferences);
    } catch (e: any) {
      setPrefs((p) => ({ ...p, [key]: previous }));
      notify("Preference not saved", e.message);
    } finally {
      setSavingPreference(null);
    }
  };
  const row = (label: string, onPress: () => void, detail?: string) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      onPress={onPress}
      style={[s.row, { borderBottomColor: colors.border }]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.foreground, fontSize: 15 }}>{label}</Text>
        {!!detail && (
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
            {detail}
          </Text>
        )}
      </View>
      <ChevronRight size={18} color={colors.mutedForeground} />
    </Pressable>
  );
  const section = (label: string, children: React.ReactNode) => (
    <View style={{ gap: 8 }}>
      <Text
        style={{
          color: colors.mutedForeground,
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.6,
        }}
      >
        {label.toUpperCase()}
      </Text>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: 10,
          paddingHorizontal: 16,
        }}
      >
        {children}
      </View>
    </View>
  );
  const checkUpdates = async () => {
    try {
      const c = await invoke("get-mobile-config");
      const installed = Constants.expoConfig?.version || "1.0.0";
      if (!c.latestVersion) {
        notify(
          "Update information unavailable",
          "Release information has not been published yet.",
        );
        return;
      }
      const parts = (v: string) => v.split(".").map(Number);
      const a = parts(c.latestVersion),
        b = parts(installed);
      let newer = false;
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] || 0) !== (b[i] || 0)) {
          newer = (a[i] || 0) > (b[i] || 0);
          break;
        }
      }
      if (!newer) {
        notify(
          "Up to date",
          `Version ${installed} is the current published release.`,
        );
        return;
      }
      const url = c.storeUrls?.[Platform.OS];
      if (
        url &&
        /^https:\/\//.test(url) &&
        (await confirmAction(
          "Update available",
          `Version ${c.latestVersion} is available. Open the store?`,
        ))
      )
        await Linking.openURL(url);
      else
        notify(
          "Update available",
          `Version ${c.latestVersion} is available. Contact support for the download link.`,
        );
    } catch (e: any) {
      notify("Could not check updates", e.message);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader />
      <ScrollView contentContainerStyle={s.content}>
        <Text
          style={{
            color: colors.foreground,
            fontSize: 32,
            fontWeight: "700",
            letterSpacing: -1,
          }}
        >
          Settings
        </Text>
        {section(
          "Appearance",
          <View style={{ paddingVertical: 16, gap: 12 }}>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Choose your theme
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
              Your choice is saved on this device.
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(
                [
                  { mode: "light", Icon: Sun, label: "Light" },
                  { mode: "dark", Icon: Moon, label: "Dark" },
                  { mode: "system", Icon: Monitor, label: "System" },
                ] as { mode: ThemeMode; Icon: any; label: string }[]
              ).map(({ mode, Icon, label }) => (
                <Pressable
                  key={mode}
                  accessibilityRole="radio"
                  accessibilityLabel={`${label} theme`}
                  accessibilityState={{ checked: themeMode === mode }}
                  aria-checked={themeMode === mode}
                  onPress={() => setThemeMode(mode)}
                  style={{
                    flex: 1,
                    minHeight: 48,
                    borderRadius: 8,
                    backgroundColor:
                      themeMode === mode
                        ? `${colors.primary}20`
                        : colors.secondary,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Icon
                    size={16}
                    color={
                      themeMode === mode
                        ? colors.primary
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={{
                      color:
                        themeMode === mode
                          ? colors.primary
                          : colors.mutedForeground,
                      fontSize: 12,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>,
        )}
        {loading && <ActivityIndicator color={colors.primary} />}
        {!!loadError && (
          <Pressable onPress={refresh}>
            <Text style={{ color: colors.destructive }}>
              {loadError} Tap to retry.
            </Text>
          </Pressable>
        )}
        {section(
          "Account",
          <>
            {row("Edit profile", () => router.push("/app/profile"))}
            {row("Change email", () => open("email"), profile?.email)}
            {row("Change password", () => open("password"))}
          </>,
        )}
        {section(
          "Subscription",
          <>
            {subscriptions
              .filter((v) => v.isActive)
              .map((v) => (
                <Text
                  key={v.id}
                  style={{ color: colors.foreground, paddingVertical: 12 }}
                >
                  {v.plan_name} · {v.status}
                </Text>
              ))}
            {row(
              "Plans and subscriptions",
              () => router.push("/app/subscriptions"),
              subscriptions.some((v) => v.isActive)
                ? "Manage your access"
                : "Artist plan · free",
            )}
          </>,
        )}
        {section(
          "Security",
          <>
            {row(
              profile?.transaction_pin_hash
                ? "Change transaction PIN"
                : "Set transaction PIN",
              () => open("pin"),
              profile?.transaction_pin_hash
                ? "A PIN is set"
                : "Required to withdraw earnings",
            )}
            {row("Recent security activity", async () => {
              open("security");
              setBusy(true);
              try {
                const { data, error: e } = await supabase
                  .from("security_logs")
                  .select("id,event,created_at,ip_address")
                  .order("created_at", { ascending: false })
                  .limit(20);
                if (e) throw e;
                setEvents(data || []);
              } catch (e: any) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            })}
          </>,
        )}
        {row("Notification inbox", () =>
          router.push("/app/notifications" as any),
        )}
        {section(
          "Notifications",
          NOTIFICATIONS.map(({ key, label }) => (
            <View
              key={key}
              style={[s.row, { borderBottomColor: colors.border }]}
            >
              <Text style={{ flex: 1, color: colors.foreground, fontSize: 14 }}>
                {label}
              </Text>
              <Switch
                accessibilityLabel={label}
                value={!!prefs[key]}
                disabled={loading || !!loadError || savingPreference !== null}
                onValueChange={(v) => toggle(key, v)}
                trackColor={{ false: colors.border, true: colors.primary }}
              />
            </View>
          )),
        )}
        {section(
          "Explore",
          <>
            {row("Campaigns", () => router.push("/app/campaigns"))}
            {row("Your music", () => router.push("/app/music"))}
          </>,
        )}
        {section(
          "Help and support",
          <>
            {row("FAQs", () => router.push("/app/faq"))}
            {row("Contact support", () => router.push("/app/support"))}
            {row("Terms of service", () => router.push("/app/terms"))}
            {row("Privacy policy", () => router.push("/app/privacy"))}
          </>,
        )}
        {section(
          "App",
          <>
            {row(
              "Check for updates",
              checkUpdates,
              `Installed version ${Constants.expoConfig?.version || "1.0.0"}`,
            )}
          </>,
        )}
        {row("Sign out", async () => {
          if (await confirmAction("Sign out", "Sign out of your account?")) {
            const { error: e } = await supabase.auth.signOut();
            if (e) notify("Could not sign out", e.message);
            else router.replace("/sign-in");
          }
        })}
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            if (
              !(await confirmAction(
                "Delete account",
                "This permanently deletes your account. Withdraw your balance first. Continue?",
              ))
            )
              return;
            try {
              await invoke("delete-account");
              await supabase.auth.signOut();
              router.replace("/sign-in");
            } catch (e: any) {
              notify("Account not deleted", e.message);
            }
          }}
          style={{ paddingVertical: 16 }}
        >
          <Text style={{ color: colors.destructive, fontSize: 15 }}>
            Delete account
          </Text>
        </Pressable>
      </ScrollView>
      <FormDialog
        visible={!!dialog}
        title={
          dialog === "email"
            ? "Change email"
            : dialog === "password"
              ? "Change password"
              : dialog === "pin"
                ? "Transaction PIN"
                : "Security activity"
        }
        error={error}
        busy={busy}
        onClose={() => setDialog(null)}
        onSubmit={dialog === "security" ? undefined : save}
      >
        {dialog === "email" && (
          <>
            {input("email", "New email")}
            {input("current", "Current password", true)}
          </>
        )}
        {dialog === "password" && (
          <>
            {input("current", "Current password", true)}
            {input("password", "New password", true)}
            {input("confirm", "Confirm new password", true)}
          </>
        )}
        {dialog === "pin" && (
          <>
            {profile?.transaction_pin_hash &&
              input("current", "Current PIN", true, true)}
            {input("pin", "New PIN", true, true)}
            {input("confirm", "Confirm PIN", true, true)}
          </>
        )}
        {dialog === "security" &&
          (busy ? (
            <ActivityIndicator color={colors.primary} />
          ) : events.length ? (
            events.map((e) => (
              <View key={e.id} style={{ paddingVertical: 10, gap: 4 }}>
                <Text style={{ color: colors.foreground }}>{e.event}</Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                  {new Date(e.created_at).toLocaleString()} ·{" "}
                  {e.ip_address || "Unknown device"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: colors.mutedForeground }}>
              No security events have been recorded.
            </Text>
          ))}
      </FormDialog>
    </View>
  );
};
const s = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: 24,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 24,
  },
  row: {
    minHeight: 56,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
