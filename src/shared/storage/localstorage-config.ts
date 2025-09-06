import { createJSONStorage } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { rehydrationTracker } from '../hooks/use-global-rehydration';
import type { PersistConfig } from './types';

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

/**
 * Create storage key with DID
 */
export function createStorageKey(baseKey: string, did: string | null): string {
  return did ? `${baseKey}-${did}` : baseKey;
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
        const did = await getCurrentDID();
        const key = createStorageKey(config.name, did);
        return localStorage.getItem(key);
      } catch (error) {
        console.error('Failed to get from localStorage:', error);
        return null;
      }
    },

    setItem: async (name: string, value: string): Promise<void> => {
      if (typeof window === 'undefined') return;

      try {
        const did = await getCurrentDID();
        const key = createStorageKey(config.name, did);
        localStorage.setItem(key, value);
      } catch (error) {
        console.error('Failed to set to localStorage:', error);
        // Don't throw on localStorage failures - just log the error
      }
    },

    removeItem: async (name: string): Promise<void> => {
      if (typeof window === 'undefined') return;

      try {
        const did = await getCurrentDID();
        const key = createStorageKey(config.name, did);
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
      return (state: any, error: Error) => {
        if (!error) {
          rehydrationTracker.markRehydrated(config.name);
        }
      };
    },
  };
}
