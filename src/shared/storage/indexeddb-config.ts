import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { rehydrationTracker } from '../hooks/use-rehydration';
import {
  type ArtifactRecord,
  type CapStudioRecord,
  type ChatSessionRecord,
  db,
} from './db';
import type { PersistConfig } from './types';

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

export class ChatSessionsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const did = await getCurrentDID();
      if (!did) return null;

      // Get all chat sessions for current DID
      const records = await db.chatSessions.where('did').equals(did).toArray();

      if (records.length === 0) return null;

      // Convert records back to chatSessions format
      const chatSessions: Record<string, any> = {};
      records.forEach((record) => {
        chatSessions[record.chatId] = record.data;
      });

      // Return in zustand persist format: { state: { chatSessions: ... }, version: 0 }
      return JSON.stringify({
        state: { chatSessions },
        version: 0,
      });
    } catch (error) {
      console.error(`Failed to get chat sessions from IndexedDB:`, error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const did = await getCurrentDID();
      if (!did) return;

      const parsedData = JSON.parse(value);

      // Handle zustand persist wrapper format: { state: { chatSessions: ... }, version: 0 }
      const chatSessions =
        parsedData.state?.chatSessions || parsedData.chatSessions;

      if (!chatSessions || Object.keys(chatSessions).length === 0) {
        return;
      }

      // Clear existing sessions for this DID
      await db.chatSessions.where('did').equals(did).delete();

      // Save each chat session as a separate record
      const records: ChatSessionRecord[] = Object.entries(chatSessions).map(
        ([chatId, data]) => ({
          chatId,
          did,
          data,
          updatedAt: Date.now(),
        }),
      );

      if (records.length > 0) {
        await db.chatSessions.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to set chat sessions in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const did = await getCurrentDID();
      if (!did) return;

      await db.chatSessions.where('did').equals(did).delete();
    } catch (error) {
      console.error(`Failed to remove chat sessions from IndexedDB:`, error);
    }
  }
}

export class CapStudioStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const did = await getCurrentDID();
      if (!did) return null;

      // Get all cap studio records for current DID
      const records = await db.capStudio.where('did').equals(did).toArray();

      if (records.length === 0) return null;

      // Convert records back to localCaps format
      const localCaps = records.map((record) => record.data);

      // Return in zustand persist format: { state: { localCaps: ... }, version: 0 }
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

      // Handle zustand persist wrapper format: { state: { localCaps: ... }, version: 0 }
      const localCaps = parsedData.state?.localCaps || parsedData.localCaps;

      if (!localCaps || localCaps.length === 0) {
        return;
      }

      // Clear existing cap studio data for this DID
      await db.capStudio.where('did').equals(did).delete();

      // Save each cap as a separate record
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

export class ArtifactsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const did = await getCurrentDID();
      if (!did) return null;

      // Get all artifact records for current DID
      const records = await db.artifacts.where('did').equals(did).toArray();

      if (records.length === 0) return null;

      // Convert records back to artifacts format (id -> artifact map)
      const artifacts: Record<string, any> = {};
      records.forEach((record) => {
        artifacts[record.id] = record.data;
      });

      // Return in zustand persist format: { state: { artifacts: ... }, version: 0 }
      return JSON.stringify({
        state: { artifacts },
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
      const did = await getCurrentDID();
      if (!did) return;

      const parsedData = JSON.parse(value);

      // Handle zustand persist wrapper format: { state: { artifacts: ... }, version: 0 }
      const artifacts = parsedData.state?.artifacts || parsedData.artifacts;

      if (!artifacts || Object.keys(artifacts).length === 0) {
        return;
      }

      // Clear existing artifacts for this DID
      await db.artifacts.where('did').equals(did).delete();

      // Save each artifact as a separate record
      const records: ArtifactRecord[] = Object.entries(artifacts).map(
        ([id, data]) => ({
          id,
          did,
          data,
          updatedAt: Date.now(),
        }),
      );

      if (records.length > 0) {
        await db.artifacts.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to set artifacts in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const did = await getCurrentDID();
      if (!did) return;

      await db.artifacts.where('did').equals(did).delete();
    } catch (error) {
      console.error(`Failed to remove artifacts from IndexedDB:`, error);
    }
  }
}

/**
 * Persist config generator for ChatSessions
 */
export function createChatSessionsPersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => new ChatSessionsStorage()),
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

/**
 * Persist config generator for CapStudio
 */
export function createCapStudioPersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
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

/**
 * Persist config generator for Artifacts
 */
export function createArtifactsPersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
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
