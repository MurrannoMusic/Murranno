import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '@/hooks/useTheme';

interface FormFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  /** Renders a show/hide toggle and hides the text by default. */
  password?: boolean;
  right?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/** Labelled text input with an inline error and, for passwords, an eye toggle. */
export const FormField = forwardRef<TextInput, FormFieldProps>(function FormField(
  { label, error, hint, password, right, containerStyle, style, ...input }, ref,
) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const border = error ? colors.destructive : focused ? colors.primary : colors.border;
  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label && <Text style={[s.label, { color: colors.foreground }]}>{label}</Text>}
      <View style={[s.wrap, { backgroundColor: colors.input, borderColor: border }]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={password ? !visible : input.secureTextEntry}
          autoCapitalize={password ? 'none' : input.autoCapitalize}
          autoCorrect={password ? false : input.autoCorrect}
          {...input}
          onFocus={(e) => { setFocused(true); input.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); input.onBlur?.(e); }}
          style={[s.input, { color: colors.foreground }, style]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            onPress={() => setVisible((v) => !v)}
            style={s.eye}
          >
            {visible ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
          </Pressable>
        )}
        {right}
      </View>
      {error ? (
        <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[s.msg, { color: colors.destructive }]}>{error}</Text>
      ) : hint ? (
        <Text style={[s.msg, { color: colors.mutedForeground }]}>{hint}</Text>
      ) : null}
    </View>
  );
});

/** A form-level error (API failure) shown above the submit button. */
export const FormError = ({ message }: { message?: string }) => {
  const { colors } = useTheme();
  if (!message) return null;
  return <Text accessibilityRole="alert" style={[s.formError, { color: colors.destructive, backgroundColor: `${colors.destructive}14` }]}>{message}</Text>;
};

const s = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600' },
  wrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, minHeight: 48 },
  input: { flex: 1, fontSize: 14, paddingVertical: 12 },
  eye: { padding: 6, marginLeft: 4 },
  msg: { fontSize: 12, lineHeight: 16 },
  formError: { fontSize: 13, lineHeight: 18, padding: 12, borderRadius: 10 },
});
