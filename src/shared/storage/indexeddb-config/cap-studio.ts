import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type CapStudioRecord } from '../db';
import type { PersistConfig } from '../types';
import { getCurrentDID } from './utils';

export class CapStudioStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const did = await getCurrentDID();
      if (!did) return null;

      const records = await db.capStudio.where('did').equals(did).toArray();
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
      const did = await getCurrentDID();
      if (!did) return;

      const parsedData = JSON.parse(value);
      const localCaps = parsedData.state?.localCaps || parsedData.localCaps;

      if (!localCaps || localCaps.length === 0) {
        return;
      }

      await db.capStudio.where('did').equals(did).delete();

      const records: CapStudioRecord[] = localCaps.map((cap: any) => ({
        id: cap.id,
        did,
        data: cap,
        updatedAt: Date.now(),
      }));

      if (records.length > 0) {
        await db.capStudio.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to set cap studio data in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const did = await getCurrentDID();
      if (!did) return;

      await db.capStudio.where('did').equals(did).delete();
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
