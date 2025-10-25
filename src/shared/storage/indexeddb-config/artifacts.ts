import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type ArtifactRecord } from '../db';
import type { PersistConfig } from '../types';
import { getCurrentAccountAddress } from './utils';

export class ArtifactsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return null;

      const records = await db.artifacts
        .where('address')
        .equals(address)
        .toArray();
      if (records.length === 0) return null;

      const artifactSessions: Record<string, any> = {};
      records.forEach((record) => {
        artifactSessions[record.id] = record.data;
      });

      return JSON.stringify({
        state: { artifactSessions },
        version: 0,
      });
    } catch (error) {
      console.error(`Failed to get artifacts from IndexedDB:`, error);
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
      const artifactSessions =
        parsedData.state?.artifactSessions || parsedData.artifactSessions;

      const entries = Object.entries(artifactSessions || {});
      const incomingIds = new Set(entries.map(([id]) => id));

      await db.artifacts
        .where('address')
        .equals(address)
        .filter((record) => !incomingIds.has(record.id))
        .delete();

      if (entries.length === 0) {
        return;
      }

      const records: ArtifactRecord[] = entries.map(([id, data]) => ({
        id,
        address,
        data,
        updatedAt: Date.now(),
      }));

      await db.artifacts.bulkPut(records);
    } catch (error) {
      console.error(`Failed to set artifacts in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return;

      await db.artifacts.where('address').equals(address).delete();
    } catch (error) {
      console.error(`Failed to remove artifacts from IndexedDB:`, error);
    }
  }
}

export function createArtifactsPersistConfig<T>(config: PersistConfig<T>) {
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => new ArtifactsStorage()),
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
