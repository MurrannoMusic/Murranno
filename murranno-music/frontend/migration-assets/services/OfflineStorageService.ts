/**
 * Offline Storage Service
 * 
 * MMKV-based storage adapter for React Query persistence.
 * Falls back to AsyncStorage for Expo Go compatibility.
 */

import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  QUERY_CACHE: 'query-cache',
  USER_PREFERENCES: 'user-preferences',
  OFFLINE_QUEUE: 'offline-queue',
  LAST_SYNC: 'last-sync',
} as const;

// Check if MMKV is available (not in Expo Go)
let mmkvInstance: MMKV | null = null;
let useMMKV = false;

try {
  mmkvInstance = new MMKV({
    id: 'murranno-offline-storage',
    encryptionKey: 'murranno-secure-key',
  });
  useMMKV = true;
} catch (error) {
  console.log('MMKV not available, falling back to AsyncStorage');
  useMMKV = false;
}

/**
 * Unified storage interface that works with both MMKV and AsyncStorage
 */
export const OfflineStorage = {
  /**
   * Get a string value from storage
   */
  getString: async (key: string): Promise<string | null> => {
    if (useMMKV && mmkvInstance) {
      return mmkvInstance.getString(key) ?? null;
    }
    return AsyncStorage.getItem(key);
  },

  /**
   * Set a string value in storage
   */
  setString: async (key: string, value: string): Promise<void> => {
    if (useMMKV && mmkvInstance) {
      mmkvInstance.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },

  /**
   * Get a boolean value from storage
   */
  getBoolean: async (key: string): Promise<boolean | null> => {
    if (useMMKV && mmkvInstance) {
      return mmkvInstance.getBoolean(key) ?? null;
    }
    const value = await AsyncStorage.getItem(key);
    return value ? value === 'true' : null;
  },

  /**
   * Set a boolean value in storage
   */
  setBoolean: async (key: string, value: boolean): Promise<void> => {
    if (useMMKV && mmkvInstance) {
      mmkvInstance.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, String(value));
  },

  /**
   * Get a number value from storage
   */
  getNumber: async (key: string): Promise<number | null> => {
    if (useMMKV && mmkvInstance) {
      return mmkvInstance.getNumber(key) ?? null;
    }
    const value = await AsyncStorage.getItem(key);
    return value ? Number(value) : null;
  },

  /**
   * Set a number value in storage
   */
  setNumber: async (key: string, value: number): Promise<void> => {
    if (useMMKV && mmkvInstance) {
      mmkvInstance.set(key, value);
      return;
    }
    await AsyncStorage.setItem(key, String(value));
  },

  /**
   * Get an object from storage (JSON parsed)
   */
  getObject: async <T>(key: string): Promise<T | null> => {
    const value = await OfflineStorage.getString(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  /**
   * Set an object in storage (JSON stringified)
   */
  setObject: async <T>(key: string, value: T): Promise<void> => {
    await OfflineStorage.setString(key, JSON.stringify(value));
  },

  /**
   * Delete a key from storage
   */
  delete: async (key: string): Promise<void> => {
    if (useMMKV && mmkvInstance) {
      mmkvInstance.delete(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },

  /**
   * Check if a key exists in storage
   */
  contains: async (key: string): Promise<boolean> => {
    if (useMMKV && mmkvInstance) {
      return mmkvInstance.contains(key);
    }
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  },

  /**
   * Get all keys in storage
   */
  getAllKeys: async (): Promise<string[]> => {
    if (useMMKV && mmkvInstance) {
      return mmkvInstance.getAllKeys();
    }
    return AsyncStorage.getAllKeys() as Promise<string[]>;
  },

  /**
   * Clear all storage
   */
  clearAll: async (): Promise<void> => {
    if (useMMKV && mmkvInstance) {
      mmkvInstance.clearAll();
      return;
    }
    await AsyncStorage.clear();
  },

  /**
   * Get storage size in bytes (MMKV only)
   */
  getSize: (): number => {
    if (useMMKV && mmkvInstance) {
      return mmkvInstance.size;
    }
    return 0; // AsyncStorage doesn't provide size info
  },

  /**
   * Check if using MMKV or AsyncStorage
   */
  isUsingMMKV: (): boolean => useMMKV,
};

/**
 * Offline Queue for storing mutations when offline
 */
export interface QueuedMutation {
  id: string;
  type: string;
  data: unknown;
  timestamp: number;
  retryCount: number;
}

export const OfflineQueue = {
  /**
   * Add a mutation to the offline queue
   */
  enqueue: async (mutation: Omit<QueuedMutation, 'id' | 'timestamp' | 'retryCount'>): Promise<void> => {
    const queue = await OfflineStorage.getObject<QueuedMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE) ?? [];
    const newMutation: QueuedMutation = {
      ...mutation,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };
    queue.push(newMutation);
    await OfflineStorage.setObject(STORAGE_KEYS.OFFLINE_QUEUE, queue);
  },

  /**
   * Get all queued mutations
   */
  getAll: async (): Promise<QueuedMutation[]> => {
    return await OfflineStorage.getObject<QueuedMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE) ?? [];
  },

  /**
   * Remove a mutation from the queue
   */
  dequeue: async (id: string): Promise<void> => {
    const queue = await OfflineStorage.getObject<QueuedMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE) ?? [];
    const filtered = queue.filter(m => m.id !== id);
    await OfflineStorage.setObject(STORAGE_KEYS.OFFLINE_QUEUE, filtered);
  },

  /**
   * Clear the entire queue
   */
  clear: async (): Promise<void> => {
    await OfflineStorage.delete(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  /**
   * Get queue size
   */
  size: async (): Promise<number> => {
    const queue = await OfflineStorage.getObject<QueuedMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE) ?? [];
    return queue.length;
  },

  /**
   * Increment retry count for a mutation
   */
  incrementRetry: async (id: string): Promise<void> => {
    const queue = await OfflineStorage.getObject<QueuedMutation[]>(STORAGE_KEYS.OFFLINE_QUEUE) ?? [];
    const mutation = queue.find(m => m.id === id);
    if (mutation) {
      mutation.retryCount++;
      await OfflineStorage.setObject(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    }
  },
};

export default OfflineStorage;
