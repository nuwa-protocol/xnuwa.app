import {
  createJSONStorage,
  type PersistOptions,
  type StateStorage,
} from 'zustand/middleware';
import { rehydrationTracker } from '../../hooks/use-rehydration';
import { db, type AccountRecord } from '../db';
import type { PersistConfig } from '../types';

export class AccountStateStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const accountRecords = await db.accounts.toArray();
      const accounts = accountRecords.map((record) => record.data);

      const currentAccountRecord = accountRecords.find(
        (record) => record.isCurrent,
      );
      const currentAccount = currentAccountRecord
        ? { address: currentAccountRecord.address }
        : null;

      return JSON.stringify({
        state: {
          accounts,
          account: currentAccount,
        },
        version: 0,
      });
    } catch (error) {
      console.error(`Failed to get account state from IndexedDB:`, error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const parsedData = JSON.parse(value);
      const { accounts, account } = parsedData.state;

      await db.accounts.clear();

      if (accounts && accounts.length > 0) {
        const records: AccountRecord[] = accounts.map((accountData: any) => ({
          address: accountData.address,
          data: accountData,
          isCurrent: account && account.address === accountData.address,
          updatedAt: Date.now(),
        }));

        await db.accounts.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to set account state in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await db.accounts.clear();
    } catch (error) {
      console.error(`Failed to remove account state from IndexedDB:`, error);
    }
  }
}

export function createAccountStatePersistConfig<
  T,
  PersistedState = Partial<T>,
>(config: PersistConfig<T, PersistedState>): PersistOptions<T, PersistedState> {
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => new AccountStateStorage()),
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
