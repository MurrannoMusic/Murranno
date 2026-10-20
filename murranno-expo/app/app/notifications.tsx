import React, { useCallback, useState } from "react";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/states/StateViews";
import { Bell } from "lucide-react-native";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { AppHeader } from "@/components/layout/AppHeader";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/api";
export default function Notifications() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: e } = await supabase
        .from("notifications")
        .select("id,title,message,type,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (e) throw e;
      setItems(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
  const mark = async (id: string) => {
    setBusy(id);
    try {
      const { error: e } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", id);
      if (e) throw e;
      setItems((list) =>
        list.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (e: any) {
      notify("Could not mark as read", e.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <AppHeader />
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: 4,
          gap: 18,
          maxWidth: 760,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary, paddingVertical: 8 }}>
            Back
          </Text>
        </Pressable>
        <Text
          style={{ fontSize: 30, fontWeight: "600", color: colors.foreground }}
        >
          Notifications
        </Text>
        {loading && !items.length ? (
          <ListSkeleton rows={5} media={false} />
        ) : error && !items.length ? (
          <ErrorState error={error} title="Couldn’t load notifications" onRetry={refresh} />
        ) : items.length ? (
          items.map((item) => (
            <View
              key={item.id}
              style={{
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                gap: 10,
              }}
            >
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: item.is_read ? "400" : "600",
                }}
              >
                {item.title}
              </Text>
              <Text style={{ color: colors.mutedForeground, lineHeight: 22 }}>
                {item.message}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }}>
                {new Date(item.created_at).toLocaleString()}
              </Text>
              {!item.is_read && (
                <Pressable
                  accessibilityRole="button"
                  disabled={!!busy}
                  onPress={() => mark(item.id)}
                  style={{ paddingVertical: 8 }}
                >
                  <Text style={{ color: colors.primary }}>
                    {busy === item.id ? "Saving..." : "Mark as read"}
                  </Text>
                </Pressable>
              )}
            </View>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="You’re all caught up"
            body="Release updates, payouts and KYC decisions will show up here."
          />
        )}
      </ScrollView>
    </View>
  );
}
