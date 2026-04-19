/**
 * Themed Checkbox for React Native
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

interface CheckboxProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled,
  error,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => !disabled && onChange(!checked)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <View
          style={[
            styles.checkbox,
            checked && styles.checkboxChecked,
            disabled && styles.checkboxDisabled,
            error && styles.checkboxError,
          ]}
        >
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        {label && (
          <Text
            style={[
              styles.label,
              disabled && styles.labelDisabled,
            ]}
          >
            {label}
          </Text>
        )}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkboxError: {
    borderColor: colors.destructive,
  },
  checkmark: {
    color: colors.primaryForeground,
    fontSize: 14,
    fontWeight: '700',
  },
  label: {
    ...typography.body,
    color: colors.foreground,
    marginLeft: spacing.sm,
    flex: 1,
  },
  labelDisabled: {
    opacity: 0.5,
  },
  error: {
    ...typography.caption,
    color: colors.destructive,
    marginTop: spacing.xs,
    marginLeft: 30,
  },
});
