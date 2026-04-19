/**
 * Input Component - React Native
 * Matches the web Input component styling
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, componentSpacing } from '../../theme/spacing';
import { textStyles, fontSize } from '../../theme/typography';
import { timing } from '../../theme/animations';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  disabled = false,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      Animated.timing(borderColor, {
        toValue: 1,
        ...timing.smooth,
      }).start();
      onFocus?.(e);
    },
    [borderColor, onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      Animated.timing(borderColor, {
        toValue: 0,
        ...timing.smooth,
      }).start();
      onBlur?.(e);
    },
    [borderColor, onBlur]
  );

  const animatedBorderColor = borderColor.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.dark.border, colors.dark.ring],
  });

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, textStyles.label]}>{label}</Text>}
      
      <Animated.View
        style={[
          styles.inputContainer,
          {
            borderColor: hasError ? colors.dark.destructive : animatedBorderColor,
          },
          disabled && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholderTextColor={colors.dark.mutedForeground}
          editable={!disabled}
          {...props}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => {
              if (onRightIconPress) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onRightIconPress();
              }
            }}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            textStyles.bodySm,
            hasError && styles.errorText,
          ]}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[1.5],
  },
  label: {
    color: colors.dark.foreground,
    marginBottom: spacing[1],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: componentSpacing.inputHeight.md,
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.dark.foreground,
    fontSize: fontSize.base,
  },
  inputWithLeftIcon: {
    marginLeft: spacing[2],
  },
  inputWithRightIcon: {
    marginRight: spacing[2],
  },
  leftIcon: {
    marginRight: spacing[2],
  },
  rightIcon: {
    marginLeft: spacing[2],
    padding: spacing[1],
  },
  helperText: {
    color: colors.dark.mutedForeground,
    marginTop: spacing[1],
  },
  errorText: {
    color: colors.dark.destructive,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Input;
