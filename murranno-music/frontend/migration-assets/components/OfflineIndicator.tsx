/**
 * Offline Indicator Component
 * 
 * Displays network status and sync state to users.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useMutationState } from '@tanstack/react-query';

const { width } = Dimensions.get('window');

interface OfflineIndicatorProps {
  // Position of the banner
  position?: 'top' | 'bottom';
  // Show syncing indicator when coming back online
  showSyncStatus?: boolean;
  // Custom offline message
  offlineMessage?: string;
  // Custom syncing message
  syncingMessage?: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'top',
  showSyncStatus = true,
  offlineMessage = "You're offline",
  syncingMessage = 'Syncing...',
}) => {
  const { isOffline, pendingSync } = useNetworkStatus();
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useState(new Animated.Value(position === 'top' ? -50 : 50))[0];
  
  // Get pending mutations count
  const pendingMutations = useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => mutation.state.status,
  });
  
  const hasPendingMutations = pendingMutations.length > 0;
  const isSyncing = showSyncStatus && (pendingSync || hasPendingMutations);

  // Animate banner in/out
  useEffect(() => {
    if (isOffline || isSyncing) {
      setIsVisible(true);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: position === 'top' ? -50 : 50,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [isOffline, isSyncing, position, translateY]);

  if (!isVisible) {
    return null;
  }

  const backgroundColor = isOffline ? '#EF4444' : '#F59E0B'; // Red for offline, amber for syncing
  const message = isOffline ? offlineMessage : syncingMessage;

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
        { backgroundColor, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {isOffline ? (
            <OfflineIcon />
          ) : (
            <SyncIcon />
          )}
        </View>
        <Text style={styles.text}>{message}</Text>
        {hasPendingMutations && !isOffline && (
          <Text style={styles.countText}>
            ({pendingMutations.length} pending)
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

/**
 * Offline icon (cloud with X)
 */
const OfflineIcon: React.FC = () => (
  <View style={styles.icon}>
    <Text style={styles.iconEmoji}>📡</Text>
  </View>
);

/**
 * Sync icon (rotating arrows)
 */
const SyncIcon: React.FC = () => {
  const [rotation] = useState(new Animated.Value(0));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.icon, { transform: [{ rotate: spin }] }]}>
      <Text style={styles.iconEmoji}>🔄</Text>
    </Animated.View>
  );
};

/**
 * Compact offline badge for use in headers
 */
export const OfflineBadge: React.FC = () => {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>Offline</Text>
    </View>
  );
};

/**
 * Hook to show offline-aware UI hints
 */
export const useOfflineHint = (message: string = 'This action requires an internet connection') => {
  const { isOffline } = useNetworkStatus();

  const showHintIfOffline = (callback: () => void) => {
    if (isOffline) {
      // You could integrate with a toast system here
      console.warn(message);
      return false;
    }
    callback();
    return true;
  };

  return { isOffline, showHintIfOffline };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  top: {
    top: 0,
  },
  bottom: {
    bottom: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  icon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 14,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  countText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default OfflineIndicator;
