/**
 * EmptyState Component - React Native
 * Displays empty state with icon, message, and optional action
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  variant = 'default',
}) => {
  const isCompact = variant === 'compact';

  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      style={[styles.container, isCompact && styles.containerCompact]}
    >
      <Animated.Text 
        entering={FadeInUp.delay(100).duration(400)}
        style={[styles.icon, isCompact && styles.iconCompact]}
      >
        {icon}
      </Animated.Text>
      
      <Animated.Text 
        entering={FadeInUp.delay(200).duration(400)}
        style={[styles.title, isCompact && styles.titleCompact]}
      >
        {title}
      </Animated.Text>
      
      {description && (
        <Animated.Text 
          entering={FadeInUp.delay(300).duration(400)}
          style={[styles.description, isCompact && styles.descriptionCompact]}
        >
          {description}
        </Animated.Text>
      )}
      
      {actionLabel && onAction && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  containerCompact: {
    minHeight: 150,
    padding: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  iconCompact: {
    fontSize: 40,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 8,
  },
  titleCompact: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  descriptionCompact: {
    fontSize: 12,
    maxWidth: 220,
  },
  actionButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
});

export default EmptyState;
