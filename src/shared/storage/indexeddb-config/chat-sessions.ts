import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type ChatSessionRecord } from '../db';
import type { PersistConfig } from '../types';
import { getCurrentAccountAddress } from './utils';

export class ChatSessionsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return null;

      const records = await db.chatSessions
        .where('address')
        .equals(address)
        .toArray();
      if (records.length === 0) return null;

      const chatSessions: Record<string, any> = {};
      records.forEach((record) => {
        chatSessions[record.chatId] = record.data;
      });

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
      if (rehydrationTracker.getStatus()[name] === false) {
        return;
      }

      const address = await getCurrentAccountAddress();
      if (!address) return;

      const parsedData = JSON.parse(value);
      const chatSessions =
        parsedData.state?.chatSessions || parsedData.chatSessions;

      const entries = Object.entries(chatSessions || {});

      // Remove stale sessions for this account
      const nextIds = new Set(entries.map(([chatId]) => chatId));
      await db.chatSessions
        .where('address')
        .equals(address)
        .filter((record) => !nextIds.has(record.chatId))
        .delete();

      if (entries.length === 0) {
        return;
      }

      const records: ChatSessionRecord[] = entries.map(([chatId, data]) => ({
        chatId,
        address,
        data,
        updatedAt: Date.now(),
      }));

      await db.chatSessions.bulkPut(records);
    } catch (error) {
      console.error(`Failed to set chat sessions in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const address = await getCurrentAccountAddress();
      if (!address) return;

      await db.chatSessions.where('address').equals(address).delete();
    } catch (error) {
      console.error(`Failed to remove chat sessions from IndexedDB:`, error);
    }
  }
}

export function createChatSessionsPersistConfig<T>(config: PersistConfig<T>) {
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
