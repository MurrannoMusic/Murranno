import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
export function FormDialog({
  visible,
  title,
  children,
  error,
  busy,
  onClose,
  onSubmit,
  submitLabel = "Save",
}: {
  visible: boolean;
  title: string;
  children: React.ReactNode;
  error?: string | null;
  busy?: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          padding: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 520,
            maxHeight: "100%",
            alignSelf: "center",
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              accessibilityRole="header"
              style={{
                color: colors.foreground,
                fontSize: 21,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              disabled={busy}
              onPress={onClose}
              hitSlop={12}
            >
              <X size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 14 }}
          >
            {children}
            {!!error && (
              <Text
                accessibilityRole="alert"
                style={{ color: colors.destructive, lineHeight: 21 }}
              >
                {error}
              </Text>
            )}
          </ScrollView>
          {!!onSubmit && (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onSubmit}
              style={{
                marginTop: 20,
                minHeight: 48,
                borderRadius: 8,
                backgroundColor: colors.primary,
                alignItems: "center",
                justifyContent: "center",
                opacity: busy ? 0.6 : 1,
              }}
            >
              {busy ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text
                  style={{
                    color: colors.onPrimary,
                    fontWeight: "600",
                    fontSize: 15,
                  }}
                >
                  {submitLabel}
                </Text>
              )}
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
