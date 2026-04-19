import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface ProgressProps {
  value: number;
  max?: number;
  style?: ViewStyle;
  indicatorStyle?: ViewStyle;
  animated?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  style,
  indicatorStyle,
  animated = true,
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: percentage,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(percentage);
    }
  }, [percentage, animated]);

  const widthInterpolation = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.indicator,
          indicatorStyle,
          { width: widthInterpolation },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: spacing[2],
    width: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  indicator: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 9999,
  },
});

export default Progress;
