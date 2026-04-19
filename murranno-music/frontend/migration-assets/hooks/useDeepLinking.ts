/**
 * useDeepLinking Hook
 * 
 * Handles deep link events, deferred deep linking for authenticated routes,
 * and OAuth callback processing.
 */

import { useEffect, useCallback, useRef } from 'react';
import { Linking } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { DeepLinkingService, ParsedDeepLink, getDeepLinkLog } from '../services/DeepLinkingService';
import { useAuth } from './useAuth';

// Storage key for deferred deep links
const DEFERRED_LINK_KEY = 'murranno_deferred_deep_link';

// Deep link event log
const linkLog: Array<{ timestamp: string; event: string; data?: any }> = [];

const logEvent = (event: string, data?: any) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data,
  };
  linkLog.push(entry);
  console.log(`[useDeepLinking] ${event}`, data || '');
  
  if (linkLog.length > 50) {
    linkLog.shift();
  }
};

export { getDeepLinkLog };

interface UseDeepLinkingOptions {
  onLinkReceived?: (parsedLink: ParsedDeepLink) => void;
  onOAuthCallback?: (tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  onNavigate?: (screen: string, params: Record<string, string>) => void;
}

export const useDeepLinking = (options: UseDeepLinkingOptions = {}) => {
  const navigation = useNavigation<NavigationProp<any>>();
  const { user, loading: authLoading } = useAuth();
  const processedUrls = useRef<Set<string>>(new Set());
  const isInitialized = useRef(false);

  /**
   * Store a deep link for later processing (after auth)
   */
  const storeDeferredLink = useCallback(async (parsedLink: ParsedDeepLink) => {
    try {
      await SecureStore.setItemAsync(
        DEFERRED_LINK_KEY,
        JSON.stringify({
          screen: parsedLink.screen,
          params: parsedLink.params,
          queryParams: parsedLink.queryParams,
          timestamp: Date.now(),
        })
      );
      logEvent('Deferred link stored', { screen: parsedLink.screen });
    } catch (error) {
      logEvent('Failed to store deferred link', { error });
    }
  }, []);

  /**
   * Retrieve and clear deferred deep link
   */
  const getDeferredLink = useCallback(async () => {
    try {
      const stored = await SecureStore.getItemAsync(DEFERRED_LINK_KEY);
      if (stored) {
        await SecureStore.deleteItemAsync(DEFERRED_LINK_KEY);
        const parsed = JSON.parse(stored);
        
        // Check if link is not too old (1 hour max)
        if (Date.now() - parsed.timestamp < 60 * 60 * 1000) {
          logEvent('Deferred link retrieved', { screen: parsed.screen });
          return parsed;
        }
        logEvent('Deferred link expired');
      }
    } catch (error) {
      logEvent('Failed to get deferred link', { error });
    }
    return null;
  }, []);

  /**
   * Navigate to a screen
   */
  const navigateToScreen = useCallback((
    screen: string, 
    params: Record<string, string> = {}
  ) => {
    logEvent('Navigating to screen', { screen, params });
    
    if (options.onNavigate) {
      options.onNavigate(screen, params);
    } else {
      // Default navigation behavior
      navigation.navigate(screen as never, params as never);
    }
  }, [navigation, options]);

  /**
   * Handle OAuth callback
   */
  const handleOAuthCallback = useCallback(async (url: string): Promise<boolean> => {
    logEvent('Handling OAuth callback', { url });

    const tokens = DeepLinkingService.extractOAuthTokens(url);

    if (!tokens.accessToken || !tokens.refreshToken) {
      logEvent('Missing OAuth tokens');
      return false;
    }

    try {
      if (options.onOAuthCallback) {
        await options.onOAuthCallback({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      }
      
      logEvent('OAuth callback handled successfully');
      return true;
    } catch (error) {
      logEvent('OAuth callback error', { error });
      return false;
    }
  }, [options]);

  /**
   * Process a deep link URL
   */
  const processDeepLink = useCallback(async (url: string) => {
    // Prevent processing same URL twice
    if (processedUrls.current.has(url)) {
      logEvent('URL already processed', { url });
      return;
    }
    processedUrls.current.add(url);

    logEvent('Processing deep link', { url });

    // Validate URL
    if (!DeepLinkingService.isValidDeepLink(url)) {
      logEvent('Invalid deep link', { url });
      return;
    }

    // Check for OAuth callback
    if (DeepLinkingService.isOAuthCallback(url)) {
      await handleOAuthCallback(url);
      return;
    }

    // Parse the URL
    const parsedLink = DeepLinkingService.parseUrl(url);
    if (!parsedLink) {
      logEvent('Failed to parse URL', { url });
      return;
    }

    // Notify callback if provided
    if (options.onLinkReceived) {
      options.onLinkReceived(parsedLink);
    }

    // Handle auth requirement
    if (parsedLink.requiresAuth && !user) {
      logEvent('Auth required, deferring link');
      await storeDeferredLink(parsedLink);
      return;
    }

    // Navigate to the screen
    navigateToScreen(
      parsedLink.screen, 
      { ...parsedLink.params, ...parsedLink.queryParams }
    );
  }, [user, handleOAuthCallback, storeDeferredLink, navigateToScreen, options]);

  /**
   * Handle URL from Linking event
   */
  const handleUrl = useCallback(({ url }: { url: string }) => {
    logEvent('URL event received', { url });
    processDeepLink(url);
  }, [processDeepLink]);

  /**
   * Check for deferred links after authentication
   */
  useEffect(() => {
    if (!authLoading && user && isInitialized.current) {
      // User just authenticated, check for deferred links
      getDeferredLink().then((deferred) => {
        if (deferred) {
          logEvent('Processing deferred link after auth');
          navigateToScreen(
            deferred.screen, 
            { ...deferred.params, ...deferred.queryParams }
          );
        }
      });
    }
  }, [user, authLoading, getDeferredLink, navigateToScreen]);

  /**
   * Initialize deep linking listener
   */
  useEffect(() => {
    logEvent('Initializing deep linking');

    // Check for initial URL (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) {
        logEvent('Initial URL found', { url });
        processDeepLink(url);
      }
      isInitialized.current = true;
    }).catch((error) => {
      logEvent('Failed to get initial URL', { error });
      isInitialized.current = true;
    });

    // Listen for URL events (warm start)
    const subscription = Linking.addEventListener('url', handleUrl);
    logEvent('URL listener registered');

    return () => {
      subscription.remove();
      logEvent('URL listener removed');
    };
  }, [processDeepLink, handleUrl]);

  return {
    processDeepLink,
    storeDeferredLink,
    getDeferredLink,
    getLog: () => [...linkLog],
  };
};

export default useDeepLinking;
