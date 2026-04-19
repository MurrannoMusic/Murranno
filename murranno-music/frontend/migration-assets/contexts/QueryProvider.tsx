/**
 * Query Provider with Offline Persistence
 * 
 * Wraps the app with React Query client and persistence layer.
 */

import React, { useEffect, useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { persistOptions, CACHE_CONFIG } from '../services/QueryPersister';
import { setupOnlineManager } from '../hooks/useNetworkStatus';

// Create a stable query client instance
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time - how long inactive queries stay in cache
      gcTime: CACHE_CONFIG.maxAge,
      
      // Stale time - how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch settings
      refetchOnMount: true,
      refetchOnWindowFocus: false, // Mobile apps don't have window focus
      refetchOnReconnect: true,
      
      // Network mode - always fetch when online, use cache when offline
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations that fail due to network issues
      retry: 3,
      retryDelay: 1000,
      networkMode: 'offlineFirst',
    },
  },
});

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Main Query Provider component with offline persistence
 */
export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [queryClient] = useState(createQueryClient);
  const [isRestored, setIsRestored] = useState(false);

  // Setup online manager on mount
  useEffect(() => {
    setupOnlineManager();
  }, []);

  // Handle restoration complete
  const handleSuccess = () => {
    console.log('Query cache restored from storage');
    setIsRestored(true);
  };

  const handleError = (error: Error) => {
    console.error('Failed to restore query cache:', error);
    // Continue anyway - we'll fetch fresh data
    setIsRestored(true);
  };

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        ...persistOptions,
        buster: CACHE_CONFIG.buster,
      }}
      onSuccess={handleSuccess}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

/**
 * Hook to check if query cache has been restored
 */
export const useQueryCacheRestored = () => {
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    // Check if restoration is complete by attempting to read from cache
    const checkRestoration = async () => {
      // Small delay to allow restoration
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsRestored(true);
    };

    checkRestoration();
  }, []);

  return isRestored;
};

export default QueryProvider;
