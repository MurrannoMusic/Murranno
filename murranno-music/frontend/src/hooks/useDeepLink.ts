import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { isNativeApp } from '@/utils/platformDetection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Deep link event log for debugging
const deepLinkLog: Array<{ timestamp: string; event: string; data?: any }> = [];

const logDeepLink = (event: string, data?: any) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    data,
  };
  deepLinkLog.push(entry);
  console.log(`[DeepLink] ${event}`, data || '');
  
  // Keep only last 50 entries
  if (deepLinkLog.length > 50) {
    deepLinkLog.shift();
  }
};

export const getDeepLinkLog = () => [...deepLinkLog];

export const useDeepLink = () => {
  const navigate = useNavigate();

  const parseTokensFromUrl = useCallback((url: string): { accessToken: string | null; refreshToken: string | null } => {
    logDeepLink('Parsing tokens from URL', { url });
    
    // Try hash fragment first (most common for OAuth)
    const hashIndex = url.indexOf('#');
    if (hashIndex !== -1) {
      const fragment = url.substring(hashIndex + 1);
      const params = new URLSearchParams(fragment);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        logDeepLink('Tokens found in hash fragment');
        return { accessToken, refreshToken };
      }
    }
    
    // Try query params as fallback
    const queryIndex = url.indexOf('?');
    if (queryIndex !== -1) {
      const query = url.substring(queryIndex + 1);
      // Remove hash if present in query string
      const cleanQuery = query.split('#')[0];
      const params = new URLSearchParams(cleanQuery);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      
      if (accessToken && refreshToken) {
        logDeepLink('Tokens found in query params');
        return { accessToken, refreshToken };
      }
    }
    
    logDeepLink('No tokens found in URL');
    return { accessToken: null, refreshToken: null };
  }, []);

  const handleOAuthCallback = useCallback(async (url: string) => {
    logDeepLink('Handling OAuth callback', { url });
    
    try {
      const { accessToken, refreshToken } = parseTokensFromUrl(url);

      if (!accessToken || !refreshToken) {
        logDeepLink('Missing tokens', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });
        toast.error('Authentication incomplete. Missing tokens.');
        return false;
      }

      logDeepLink('Establishing session', { 
        accessTokenLength: accessToken.length,
        refreshTokenLength: refreshToken.length 
      });

      // Establish Supabase session
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) {
        logDeepLink('Session error', { error: sessionError.message });
        toast.error('Failed to complete sign in. Please try again.');
        return false;
      }

      logDeepLink('Session established', {
        userId: sessionData.user?.id,
        email: sessionData.user?.email
      });

      toast.success('Successfully signed in!');

      // Close the in-app browser
      try {
        await Browser.close();
        logDeepLink('Browser closed');
      } catch (browserError) {
        logDeepLink('Browser close failed', { error: browserError });
      }

      // Navigate to dashboard
      navigate('/app/dashboard');
      return true;
    } catch (error) {
      logDeepLink('Unexpected error', { error });
      toast.error('An error occurred during sign in.');
      return false;
    }
  }, [navigate, parseTokensFromUrl]);

  useEffect(() => {
    if (!isNativeApp()) {
      logDeepLink('Not a native app, skipping deep link setup');
      return;
    }

    logDeepLink('Setting up deep link listener');

    const handleAppUrlOpen = async (data: { url: string }) => {
      logDeepLink('App URL opened', { url: data.url });
      
      // Handle OAuth callback
      if (data.url.startsWith('murranno://callback')) {
        await handleOAuthCallback(data.url);
        return;
      }

      // Handle other deep links here
      // Example: murranno://releases/123
      const url = new URL(data.url);
      const path = url.pathname || url.host;
      
      logDeepLink('Navigating to path', { path });
      
      if (path && path !== 'callback') {
        navigate(`/${path}`);
      }
    };

    // Listen for app URL open events
    let listenerHandle: { remove: () => void } | null = null;
    
    CapApp.addListener('appUrlOpen', handleAppUrlOpen).then(handle => {
      listenerHandle = handle;
      logDeepLink('Deep link listener registered');
    }).catch(error => {
      logDeepLink('Failed to register listener', { error });
    });

    // Check if app was opened with a URL (cold start)
    CapApp.getLaunchUrl().then(result => {
      if (result?.url) {
        logDeepLink('App launched with URL', { url: result.url });
        handleAppUrlOpen({ url: result.url });
      }
    }).catch(error => {
      logDeepLink('Failed to get launch URL', { error });
    });

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
        logDeepLink('Deep link listener removed');
      }
    };
  }, [navigate, handleOAuthCallback]);
};
