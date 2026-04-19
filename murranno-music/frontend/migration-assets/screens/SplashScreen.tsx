/**
 * Splash Screen - React Native
 * Matches the web Splash page with animated logo and particles
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Music, Radio, Disc3, Mic2, Headphones } from 'lucide-react-native';
import { colors, gradients } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { textStyles, fontSize, fontWeight } from '../theme/typography';
import { timing, createFloatAnimation, createSpinAnimation } from '../theme/animations';

const { width, height } = Dimensions.get('window');

// Particle configuration
const particles = [
  { Icon: Music, top: '10%', left: '15%', delay: 0, duration: 8000 },
  { Icon: Radio, top: '20%', left: '80%', delay: 1000, duration: 10000 },
  { Icon: Disc3, top: '60%', left: '10%', delay: 2000, duration: 12000 },
  { Icon: Mic2, top: '70%', left: '85%', delay: 500, duration: 9000 },
  { Icon: Headphones, top: '40%', left: '90%', delay: 1500, duration: 11000 },
  { Icon: Music, top: '80%', left: '20%', delay: 2500, duration: 10000 },
  { Icon: Radio, top: '15%', left: '70%', delay: 3000, duration: 13000 },
  { Icon: Disc3, top: '50%', left: '5%', delay: 1000, duration: 9000 },
];

interface FloatingParticleProps {
  Icon: typeof Music;
  top: string;
  left: string;
  delay: number;
  duration: number;
}

const FloatingParticle: React.FC<FloatingParticleProps> = ({
  Icon,
  top,
  left,
  delay,
  duration,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      createFloatAnimation(translateY, opacity, duration).start();
    }, delay);

    return () => clearTimeout(timeout);
  }, [translateY, opacity, delay, duration]);

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          top,
          left,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <Icon size={24} color={colors.dark.primary} strokeWidth={1.5} />
    </Animated.View>
  );
};

interface AnimatedLogoProps {
  onAnimationComplete?: () => void;
}

const AnimatedLogo: React.FC<AnimatedLogoProps> = ({ onAnimationComplete }) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Scale in animation
    Animated.spring(scaleValue, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();

    // Continuous spin animation for the ring
    createSpinAnimation(rotateValue, 8000).start();

    // Pulse animation for glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleValue, rotateValue, pulseValue]);

  const spin = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.logoContainer,
        { transform: [{ scale: scaleValue }] },
      ]}
    >
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowRing,
          { transform: [{ scale: pulseValue }] },
        ]}
      />

      {/* Main logo container */}
      <LinearGradient
        colors={['rgb(124, 58, 237)', 'rgb(168, 85, 247)', 'rgb(236, 72, 153)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoGradient}
      >
        {/* Inner gradient overlay */}
        <View style={styles.innerOverlay} />

        {/* Logo image */}
        <Image
          source={require('../assets/favicon.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />

        {/* Rotating ring */}
        <Animated.View
          style={[
            styles.rotatingRing,
            { transform: [{ rotate: spin }] },
          ]}
        >
          <View style={styles.ringDot} />
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
};

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const dotsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered fade in animations
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        ...timing.smooth,
      }),
      Animated.delay(300),
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 300,
        ...timing.smooth,
      }),
      Animated.delay(300),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 300,
        ...timing.smooth,
      }),
      Animated.delay(300),
      Animated.timing(dotsFade, {
        toValue: 1,
        duration: 300,
        ...timing.smooth,
      }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, titleFade, taglineFade, dotsFade, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Gradient background */}
      <LinearGradient
        colors={gradients.mesh.colors as any}
        locations={gradients.mesh.locations}
        start={gradients.mesh.start}
        end={gradients.mesh.end}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated gradient overlay */}
      <View style={styles.gradientOverlay} />

      {/* Floating particles */}
      {particles.map((particle, index) => (
        <FloatingParticle key={index} {...particle} />
      ))}

      {/* Main content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <AnimatedLogo />

        {/* App name with gradient */}
        <Animated.Text style={[styles.title, { opacity: titleFade }]}>
          Murranno
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
          Distribute. Promote. Earn.
        </Animated.Text>

        {/* Loading dots */}
        <Animated.View style={[styles.dotsContainer, { opacity: dotsFade }]}>
          <LoadingDots />
        </Animated.View>
      </Animated.View>

      {/* Radial glow effect */}
      <View style={styles.radialGlow} />
    </View>
  );
};

const LoadingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(1)).current;
  const dot2 = useRef(new Animated.Value(1)).current;
  const dot3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createPulse = (value: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createPulse(dot1, 0),
      createPulse(dot2, 200),
      createPulse(dot3, 400),
    ]).start();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.dots}>
      <Animated.View style={[styles.dot, { opacity: dot1 }]} />
      <Animated.View style={[styles.dot, { opacity: dot2 }]} />
      <Animated.View style={[styles.dot, { opacity: dot3 }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  particle: {
    position: 'absolute',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124, 58, 237, 0.3)',
  },
  logoGradient: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
  },
  innerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 64,
    borderWidth: 8,
    borderColor: 'rgba(248, 250, 252, 0.1)',
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  rotatingRing: {
    position: 'absolute',
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  ringDot: {
    position: 'absolute',
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginTop: spacing[8],
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.dark.foreground,
    // Note: Gradient text requires MaskedView in RN
    // For simplicity, using solid color here
  },
  tagline: {
    marginTop: spacing[4],
    fontSize: fontSize.lg,
    color: colors.dark.mutedForeground,
  },
  dotsContainer: {
    marginTop: spacing[12],
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.dark.primary,
  },
  radialGlow: {
    position: 'absolute',
    width: width * 2,
    height: height * 2,
    borderRadius: width,
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    opacity: 0.5,
  },
});

export default SplashScreen;
