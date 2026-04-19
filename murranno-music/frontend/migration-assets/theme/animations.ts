/**
 * Animation System - React Native
 * Matches the CSS animations from index.css
 */

import { Animated, Easing } from 'react-native';

// Timing configurations matching CSS transitions
export const timing = {
  // --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
  smooth: {
    duration: 300,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  },
  
  // --transition-bounce: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)
  bounce: {
    duration: 500,
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    useNativeDriver: true,
  },
  
  // Quick interactions
  quick: {
    duration: 150,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  },
  
  // Slow, subtle animations
  slow: {
    duration: 600,
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    useNativeDriver: true,
  },
};

// Spring configurations
export const spring = {
  default: {
    tension: 100,
    friction: 12,
    useNativeDriver: true,
  },
  bouncy: {
    tension: 120,
    friction: 8,
    useNativeDriver: true,
  },
  stiff: {
    tension: 200,
    friction: 20,
    useNativeDriver: true,
  },
  gentle: {
    tension: 40,
    friction: 7,
    useNativeDriver: true,
  },
};

// Animation presets
export const createFadeIn = (value: Animated.Value) => {
  return Animated.timing(value, {
    toValue: 1,
    ...timing.smooth,
  });
};

export const createFadeOut = (value: Animated.Value) => {
  return Animated.timing(value, {
    toValue: 0,
    ...timing.smooth,
  });
};

export const createScaleIn = (value: Animated.Value) => {
  return Animated.spring(value, {
    toValue: 1,
    ...spring.bouncy,
  });
};

export const createScaleOut = (value: Animated.Value) => {
  return Animated.timing(value, {
    toValue: 0.95,
    ...timing.quick,
  });
};

export const createSlideUp = (value: Animated.Value, distance: number = 20) => {
  value.setValue(distance);
  return Animated.timing(value, {
    toValue: 0,
    ...timing.smooth,
  });
};

export const createSlideDown = (value: Animated.Value, distance: number = 20) => {
  return Animated.timing(value, {
    toValue: distance,
    ...timing.smooth,
  });
};

// Float animation (for particles)
export const createFloatAnimation = (
  translateY: Animated.Value,
  opacity: Animated.Value,
  duration: number = 8000
) => {
  return Animated.loop(
    Animated.parallel([
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
    ])
  );
};

// Pulse animation
export const createPulseAnimation = (scale: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.05,
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
        useNativeDriver: true,
      }),
    ])
  );
};

// Spin animation (for loading indicators)
export const createSpinAnimation = (rotate: Animated.Value, duration: number = 8000) => {
  return Animated.loop(
    Animated.timing(rotate, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  );
};

// Scale on press animation
export const createPressAnimation = (
  scale: Animated.Value,
  isPressed: boolean
) => {
  return Animated.spring(scale, {
    toValue: isPressed ? 0.95 : 1,
    ...spring.bouncy,
  });
};

// Hover scale animation (for interactive elements)
export const createHoverAnimation = (
  scale: Animated.Value,
  isHovered: boolean
) => {
  return Animated.spring(scale, {
    toValue: isHovered ? 1.02 : 1,
    ...spring.default,
  });
};

// Stagger animation helper
export const createStaggeredAnimation = (
  animations: Animated.CompositeAnimation[],
  delay: number = 100
) => {
  return Animated.stagger(delay, animations);
};

// Interpolation helpers
export const interpolateRotation = (value: Animated.Value) => {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
};

export const interpolateScale = (value: Animated.Value, min: number = 0.95, max: number = 1.05) => {
  return value.interpolate({
    inputRange: [0, 1],
    outputRange: [min, max],
  });
};
