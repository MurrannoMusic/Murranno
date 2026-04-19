import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number; style?: ViewStyle }> = ({
  lines = 1,
  style,
}) => (
  <View style={[styles.textContainer, style]}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 && lines > 1 ? '70%' : '100%'}
        style={index > 0 ? { marginTop: spacing[2] } : undefined}
      />
    ))}
  </View>
);

export const SkeletonAvatar: React.FC<{
  size?: number;
  style?: ViewStyle;
}> = ({ size = 40, style }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />
);

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <View style={styles.cardHeader}>
      <SkeletonAvatar size={48} />
      <View style={styles.cardHeaderText}>
        <Skeleton height={16} width="60%" />
        <Skeleton height={12} width="40%" style={{ marginTop: spacing[2] }} />
      </View>
    </View>
    <SkeletonText lines={3} style={{ marginTop: spacing[4] }} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.muted,
  },
  textContainer: {
    width: '100%',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: `${colors.border}33`,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: spacing[3],
  },
});

export default Skeleton;
