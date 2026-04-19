/**
 * React Query Persister Configuration
 * 
 * Persists React Query cache to MMKV/AsyncStorage for offline support.
 */

import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache configuration
export const CACHE_CONFIG = {
  // Maximum age of cached data (24 hours)
  maxAge: 1000 * 60 * 60 * 24,
  
  // Buster key - increment to invalidate all cache
  buster: 'v1',
  
  // Query keys to persist (others will be ignored)
  persistableQueryKeys: [
    'releases',
    'artist',
    'earnings',
    'campaigns',
    'promotions',
    'notifications',
    'wallet-balance',
    'profile',
  ],
};

// Try to use MMKV, fall back to AsyncStorage
let mmkvInstance: MMKV | null = null;
let useMMKV = false;

try {
  mmkvInstance = new MMKV({
    id: 'query-cache-storage',
  });
  useMMKV = true;
} catch (error) {
  console.log('MMKV not available for query cache, using AsyncStorage');
  useMMKV = false;
}

/**
 * MMKV-based synchronous storage adapter
 */
const mmkvStorageAdapter = mmkvInstance ? {
  getItem: (key: string): string | null => {
    return mmkvInstance!.getString(key) ?? null;
  },
  setItem: (key: string, value: string): void => {
    mmkvInstance!.set(key, value);
  },
  removeItem: (key: string): void => {
    mmkvInstance!.delete(key);
  },
} : null;

/**
 * Create the appropriate persister based on storage availability
 */
export const createQueryPersister = (): Persister => {
  if (useMMKV && mmkvStorageAdapter) {
    // Use synchronous MMKV persister for better performance
    return createSyncStoragePersister({
      storage: mmkvStorageAdapter,
      key: 'REACT_QUERY_OFFLINE_CACHE',
      throttleTime: 1000, // Throttle writes to every 1 second
      serialize: (data) => JSON.stringify(data),
      deserialize: (data) => JSON.parse(data),
    });
  }

  // Fall back to AsyncStorage persister
  return createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'REACT_QUERY_OFFLINE_CACHE',
    throttleTime: 1000,
    serialize: (data) => JSON.stringify(data),
    deserialize: (data) => JSON.parse(data),
  });
};

/**
 * Filter function to determine which queries should be persisted
 */
export const shouldPersistQuery = (queryKey: readonly unknown[]): boolean => {
  const keyString = queryKey[0];
  
  if (typeof keyString !== 'string') {
    return false;
  }
  
  return CACHE_CONFIG.persistableQueryKeys.some(
    persistableKey => keyString.startsWith(persistableKey)
  );
};

/**
 * Custom persister with query filtering
 */
export const createFilteredPersister = (): Persister => {
  const basePersister = createQueryPersister();
  
  return {
    persistClient: async (client: PersistedClient) => {
      // Filter out queries that shouldn't be persisted
      const filteredClient: PersistedClient = {
        ...client,
        clientState: {
          ...client.clientState,
          queries: client.clientState.queries.filter(query =>
            shouldPersistQuery(query.queryKey)
          ),
        },
      };
      
      await basePersister.persistClient(filteredClient);
    },
    
    restoreClient: () => basePersister.restoreClient(),
    
    removeClient: () => basePersister.removeClient(),
  };
};

/**
 * Dehydrate options for React Query
 */
export const dehydrateOptions = {
  shouldDehydrateQuery: (query: { queryKey: readonly unknown[] }) => {
    // Only dehydrate successful queries that should be persisted
    return shouldPersistQuery(query.queryKey);
  },
};

/**
 * Persist options for PersistQueryClientProvider
 */
export const persistOptions = {
  persister: createFilteredPersister(),
  maxAge: CACHE_CONFIG.maxAge,
  buster: CACHE_CONFIG.buster,
  dehydrateOptions,
};

export default persistOptions;
