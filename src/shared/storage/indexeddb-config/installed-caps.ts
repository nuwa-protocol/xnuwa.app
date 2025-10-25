import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type InstalledCapRecord } from '../db';
import type { PersistConfig } from '../types';
import { getCurrentDID } from './utils';

export class InstalledCapsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const did = await getCurrentDID();
      if (!did) return null;

      const records = await db.installedCaps
        .where('did')
        .equals(did)
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
      const did = await getCurrentDID();
      if (!did) return;

      const parsedData = JSON.parse(value);
      const installedCaps =
        parsedData.state?.installedCaps || parsedData.installedCaps;

      if (!installedCaps || installedCaps.length === 0) {
        return;
      }

      await db.installedCaps.where('did').equals(did).delete();

      const records: InstalledCapRecord[] = installedCaps.map((cap: any) => ({
        id: cap.id,
        did,
        data: cap,
        updatedAt: Date.now(),
      }));

      if (records.length > 0) {
        await db.installedCaps.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to set installed caps in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const did = await getCurrentDID();
      if (!did) return;

      await db.installedCaps.where('did').equals(did).delete();
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
