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
      if (rehydrationTracker.getStatus()[name] === false) {
        return;
      }

      const parsedData = JSON.parse(value);
      const { accounts, account } = parsedData.state;

      const nextAccounts: AccountRecord[] = (accounts || []).map(
        (accountData: any) => ({
          address: accountData.address,
          data: accountData,
          isCurrent: Boolean(account && account.address === accountData.address),
          updatedAt: Date.now(),
        }),
      );
      const nextAddresses = new Set(
        nextAccounts.map((record) => record.address),
      );

      await db.accounts
        .filter((record) => !nextAddresses.has(record.address))
        .delete();

      if (nextAccounts.length > 0) {
        await db.accounts.bulkPut(nextAccounts);
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
      // Mark rehydration complete regardless of whether there was any
      // persisted state. On a fresh install (empty IndexedDB), Zustand
      // passes `undefined` here, which previously left the store marked
      // as "not rehydrated" and blocked auth-gated UIs from rendering.
      return (_state: T | undefined, _error: unknown) => {
        rehydrationTracker.markRehydrated(config.name);
      };
    },
  };
}
