/**
 * LoadingScreen Component - React Native
 * Full-screen loading indicator with animated logo
 */

import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface LoadingScreenProps {
  message?: string;
  variant?: 'fullscreen' | 'inline' | 'overlay';
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
  variant = 'fullscreen',
}) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { 
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const containerStyle = [
    styles.container,
    variant === 'inline' && styles.containerInline,
    variant === 'overlay' && styles.containerOverlay,
  ];

  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={containerStyle}
    >
      <View style={styles.content}>
        {/* Animated Logo Circle */}
        <Animated.View style={[styles.logoContainer, animatedStyle]}>
          <View style={styles.logoRing}>
            <View style={styles.logoHighlight} />
          </View>
        </Animated.View>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={styles.spinner}
        />
        
        {/* Message */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  containerInline: {
    flex: 0,
    padding: 32,
    minHeight: 200,
  },
  containerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.9)',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  logoRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHighlight: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

export default LoadingScreen;
