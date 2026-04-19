/**
 * Network Status Hook
 * 
 * Monitors network connectivity and integrates with React Query's online manager.
 */

import { useEffect, useState, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifi: boolean;
  isCellular: boolean;
}

/**
 * Hook to monitor network connectivity status
 */
export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: null,
    isWifi: false,
    isCellular: false,
  });

  const [wasOffline, setWasOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(false);

  // Parse network state into our format
  const parseNetworkState = useCallback((state: NetInfoState): NetworkStatus => {
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    };
  }, []);

  // Handle network state changes
  const handleNetworkChange = useCallback((state: NetInfoState) => {
    const newStatus = parseNetworkState(state);
    const isOnline = newStatus.isConnected && newStatus.isInternetReachable !== false;

    // Update React Query's online manager
    onlineManager.setOnline(isOnline);

    // Track if we're coming back online
    if (isOnline && wasOffline) {
      setPendingSync(true);
      // Reset pending sync after a delay
      setTimeout(() => setPendingSync(false), 3000);
    }

    setWasOffline(!isOnline);
    setNetworkStatus(newStatus);
  }, [parseNetworkState, wasOffline]);

  // Initialize and subscribe to network changes
  useEffect(() => {
    let unsubscribe: NetInfoSubscription | null = null;

    const initNetworkListener = async () => {
      // Get initial state
      const initialState = await NetInfo.fetch();
      handleNetworkChange(initialState);

      // Subscribe to changes
      unsubscribe = NetInfo.addEventListener(handleNetworkChange);
    };

    initNetworkListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [handleNetworkChange]);

  // Computed properties
  const isOnline = networkStatus.isConnected && networkStatus.isInternetReachable !== false;
  const isOffline = !isOnline;

  // Force refresh network status
  const refreshStatus = useCallback(async () => {
    const state = await NetInfo.fetch();
    handleNetworkChange(state);
    return parseNetworkState(state);
  }, [handleNetworkChange, parseNetworkState]);

  return {
    ...networkStatus,
    isOnline,
    isOffline,
    pendingSync,
    refreshStatus,
  };
};

/**
 * Setup React Query online manager with NetInfo
 * Call this once at app startup
 */
export const setupOnlineManager = () => {
  // Configure online manager to use NetInfo
  onlineManager.setEventListener((setOnline) => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected && state.isInternetReachable !== false;
      setOnline(isOnline);
    });

    return () => unsubscribe();
  });
};

/**
 * Hook to get simple online/offline status
 */
export const useIsOnline = (): boolean => {
  const { isOnline } = useNetworkStatus();
  return isOnline;
};

/**
 * Hook to detect when coming back online
 */
export const useOnReconnect = (callback: () => void) => {
  const { isOnline } = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      callback();
      setWasOffline(false);
    }
  }, [isOnline, wasOffline, callback]);
};

export default useNetworkStatus;
