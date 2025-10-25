import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type CapStudioRecord } from '../db';
import type { PersistConfig } from '../types';
import { getCurrentAccountAddress } from './utils';

export class CapStudioStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return null;

      const records = await db.capStudio
        .where('address')
        .equals(address)
        .toArray();
      if (records.length === 0) return null;

      const localCaps = records.map((record) => record.data);

      return JSON.stringify({
        state: { localCaps },
        version: 0,
      });
    } catch (error) {
      console.error(`Failed to get cap studio data from IndexedDB:`, error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      if (rehydrationTracker.getStatus()[name] === false) {
        return;
      }

      const address = await getCurrentAccountAddress();
      if (!address) return;

      const parsedData = JSON.parse(value);
      const localCaps = parsedData.state?.localCaps || parsedData.localCaps;

      const caps = Array.isArray(localCaps) ? localCaps : [];
      const incomingIds = new Set(caps.map((cap: any) => cap.id));

      // Remove stale caps scoped to this account
      await db.capStudio
        .where('address')
        .equals(address)
        .filter((record) => !incomingIds.has(record.id))
        .delete();

      if (caps.length === 0) {
        return;
      }

      const records: CapStudioRecord[] = caps.map((cap: any) => ({
        id: cap.id,
        address,
        data: cap,
        updatedAt: Date.now(),
      }));

      await db.capStudio.bulkPut(records);
    } catch (error) {
      console.error(`Failed to set cap studio data in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return;

      await db.capStudio.where('address').equals(address).delete();
    } catch (error) {
      console.error(`Failed to remove cap studio data from IndexedDB:`, error);
    }
  }
}

export function createCapStudioPersistConfig<T>(config: PersistConfig<T>) {
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => new CapStudioStorage()),
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
