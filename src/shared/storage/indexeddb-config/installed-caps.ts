import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type InstalledCapRecord } from '../db';
import type { PersistConfig } from '../types';
import { getCurrentAccountAddress } from './utils';

export class InstalledCapsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return null;

      const records = await db.installedCaps
        .where('address')
        .equals(address)
        .toArray();
      if (records.length === 0) return null;

      const installedCaps = records.map((record) => record.data);
      return JSON.stringify({
        state: { installedCaps },
        version: 0,
      });
    } catch (error) {
      console.error(`Failed to get installed caps from IndexedDB:`, error);
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
      const installedCaps =
        parsedData.state?.installedCaps || parsedData.installedCaps;

      const caps = Array.isArray(installedCaps) ? installedCaps : [];
      const allowedIds = new Set(caps.map((cap: any) => cap.id));

      await db.installedCaps
        .where('address')
        .equals(address)
        .filter((record) => !allowedIds.has(record.id))
        .delete();

      if (caps.length === 0) {
        return;
      }

      const records: InstalledCapRecord[] = caps.map((cap: any) => ({
        id: cap.id,
        address,
        data: cap,
        updatedAt: Date.now(),
      }));

      await db.installedCaps.bulkPut(records);
    } catch (error) {
      console.error(`Failed to set installed caps in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return;

      await db.installedCaps.where('address').equals(address).delete();
    } catch (error) {
      console.error(`Failed to remove installed caps from IndexedDB:`, error);
    }
  }
}

export function createInstalledCapsPersistConfig<T>(
  config: PersistConfig<T>,
) {
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => new InstalledCapsStorage()),
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
