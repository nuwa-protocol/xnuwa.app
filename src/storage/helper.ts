import { createJSONStorage } from "zustand/middleware";
import { storageActions } from "./actions";
import type { PersistConfig } from "./types";

/**
 * Create storage key with DID
 */
export function createStorageKey(baseKey: string, did: string | null): string {
  return did ? `${baseKey}-${did}` : baseKey;
}

/**
 * Create unified persist storage adapter
 */
export function createPersistStorage<T>(config: PersistConfig<T>) {
  return {
    getItem: async (name: string): Promise<string | null> => {
      const did = await config.getCurrentDID();
      const key = createStorageKey(config.name, did);
      const data = await storageActions.syncFromCache<T>(key);
      return data ? JSON.stringify(data) : null;
    },

    setItem: async (name: string, value: string): Promise<void> => {
      const did = await config.getCurrentDID();
      const key = createStorageKey(config.name, did);
      const data = JSON.parse(value);
      await storageActions.syncToCache(key, data);
    },

    removeItem: async (name: string): Promise<void> => {
      const did = await config.getCurrentDID();
      const key = createStorageKey(config.name, did);
      await storageActions.syncToCache(key, null);
    },
  };
}

/**
 * Standard persist config generator
 */
export function createPersistConfig<T>(config: PersistConfig<T>) {
  return {
    name: config.name,
    storage: createJSONStorage(() => createPersistStorage(config)),
    partialize: config.partialize,
    onRehydrateStorage: config.onRehydrateStorage,
  };
}
