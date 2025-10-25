import { createJSONStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../hooks/use-rehydration';
import { getCurrentAccountAddress } from './account-identity';
import type { PersistConfig } from './types';

/**
 * Create storage key scoped by current account address
 */
export function createStorageKey(
  baseKey: string,
  address: string | null,
): string {
  return address ? `${baseKey}-${address}` : baseKey;
}

/**
 * Create localStorage-based storage for simple data (settings, cap stores)
 */
export function createLocalStorageHelper<T>(
  config: Pick<PersistConfig<T>, 'name'>,
) {
  return {
    getItem: async (name: string): Promise<string | null> => {
      if (typeof window === 'undefined') return null;

      try {
        const address = await getCurrentAccountAddress();
        const key = createStorageKey(config.name, address);
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Failed to get from localStorage:', error);
        return null;
      }
    },

    setItem: async (name: string, value: string): Promise<void> => {
      if (typeof window === 'undefined') return;

      try {
        const address = await getCurrentAccountAddress();
        const key = createStorageKey(config.name, address);
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to set to localStorage:', error);
        // Don't throw on localStorage failures - just log the error
      }
    },

    removeItem: async (name: string): Promise<void> => {
      if (typeof window === 'undefined') return;

      try {
        const address = await getCurrentAccountAddress();
        const key = createStorageKey(config.name, address);
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
      }
    },
  };
}

/**
 * Standard persist config generator for localStorage-based stores
 */
export function createLocalStoragePersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => createLocalStorageHelper(config)),
    partialize: config.partialize,
    onRehydrateStorage: () => {
      return (state: T | undefined, error: unknown) => {
        if (!error && state) {
          rehydrationTracker.markRehydrated(config.name);
        }
      };
    },
  };
}
