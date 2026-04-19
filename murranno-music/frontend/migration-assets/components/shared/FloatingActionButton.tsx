/**
 * FloatingActionButton - React Native
 * Matches web FloatingActionButton component
 */

import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { gradients } from '../../theme/gradients';
import { shadows } from '../../theme/shadows';

interface FloatingActionButtonProps {
  icon?: string;
  onPress: () => void;
  position?: 'bottomRight' | 'bottomLeft' | 'bottomCenter';
  style?: ViewStyle;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'accent';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = 'add',
  onPress,
  position = 'bottomRight',
  style,
  size = 'medium',
  variant = 'primary',
}) => {
  const getPositionStyle = () => {
    switch (position) {
      case 'bottomLeft':
        return { left: 20 };
      case 'bottomCenter':
        return { left: '50%', transform: [{ translateX: -28 }] };
      default:
        return { right: 20 };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { width: 48, height: 48 };
      case 'large':
        return { width: 64, height: 64 };
      default:
        return { width: 56, height: 56 };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 32;
      default:
        return 28;
    }
  };

  const getGradient = () => {
    switch (variant) {
      case 'secondary':
        return gradients.secondary;
      case 'accent':
        return gradients.accent;
      default:
        return gradients.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        getPositionStyle() as any,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={getGradient().colors}
        start={getGradient().start}
        end={getGradient().end}
        style={[styles.gradient, getSizeStyle()]}
      >
        <Ionicons name={icon as any} size={getIconSize()} color={colors.white} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    borderRadius: 28,
    overflow: 'hidden',
    ...shadows.accent,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
  },
});

export default FloatingActionButton;
