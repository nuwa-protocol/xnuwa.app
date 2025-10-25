import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { rehydrationTracker } from '../hooks/use-rehydration';
import {
  type AccountRecord,
  type ArtifactRecord,
  type CapStudioRecord,
  type ChatSessionRecord,
  db,
  type InstalledCapRecord,
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

      // Convert records back to artifactSessions format expected by the zustand store
      const artifactSessions: Record<string, any> = {};
      records.forEach((record) => {
        artifactSessions[record.id] = record.data;
      });

      // Return in zustand persist format: { state: { artifactSessions: ... }, version: 0 }
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
      const did = await getCurrentDID();
      if (!did) return;

      const parsedData = JSON.parse(value);

      // Handle zustand persist wrapper format: { state: { artifactSessions: ... }, version: 0 }
      // Note: fall back to top-level as a safeguard during migrations
      const artifactSessions =
        parsedData.state?.artifactSessions || parsedData.artifactSessions;

      if (!artifactSessions || Object.keys(artifactSessions).length === 0) {
        return;
      }

      // Clear existing artifacts for this DID
      await db.artifacts.where('did').equals(did).delete();

      // Save each artifact session as a separate record (still stored in the `artifacts` table)
      const records: ArtifactRecord[] = Object.entries(artifactSessions).map(
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

export class InstalledCapsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const did = await getCurrentDID();
      if (!did) return null;

      const records = await db.installedCaps.where('did').equals(did).toArray();
      if (records.length === 0) return null;

      const installedCaps = records.map((r) => r.data);
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

export class AccountsStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      // Get all account records
      const records = await db.accounts.toArray();

      if (records.length === 0) return null;

      // Convert records back to accounts format
      const accounts = records.map((record) => record.data);

      // Return in zustand persist format: { state: { accounts: ... }, version: 0 }
      return JSON.stringify({
        state: { accounts },
        version: 0,
      });
    } catch (error) {
      console.error(`Failed to get accounts from IndexedDB:`, error);
      return null;
    }
  }

  async setItem(name: string, value: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const parsedData = JSON.parse(value);

      // Handle zustand persist wrapper format: { state: { accounts: ... }, version: 0 }
      const accounts = parsedData.state?.accounts || parsedData.accounts;

      if (!accounts || accounts.length === 0) {
        return;
      }

      // Clear existing accounts
      await db.accounts.clear();

      // Save each account as a separate record
      const records: AccountRecord[] = accounts.map((account: any) => ({
        address: account.address,
        data: account,
        updatedAt: Date.now(),
      }));

      if (records.length > 0) {
        await db.accounts.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to set accounts in IndexedDB:`, error);
      throw error;
    }
  }

  async removeItem(name: string): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      await db.accounts.clear();
    } catch (error) {
      console.error(`Failed to remove accounts from IndexedDB:`, error);
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

/**
 * Persist config generator for Installed Caps
 */
export function createInstalledCapsPersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
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

/**
 * Storage class for complete account state (accounts + current account)
 */
export class AccountStateStorage implements StateStorage {
  async getItem(name: string): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      // Get all account records
      const accountRecords = await db.accounts.toArray();
      const accounts = accountRecords.map((record) => record.data);

      // Find current account (marked with isCurrent: true)
      const currentAccountRecord = accountRecords.find(
        (record) => record.isCurrent,
      );
      const currentAccount = currentAccountRecord
        ? currentAccountRecord.data
        : null;

      // Return in zustand persist format
      return JSON.stringify({
        state: {
          accounts,
          account: currentAccount, // 使用 account 而不是 currentAccount 以匹配 store 结构
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

      // Clear existing accounts
      await db.accounts.clear();

      if (accounts && accounts.length > 0) {
        // Save each account as a separate record
        const records: AccountRecord[] = accounts.map((accountData: any) => ({
          address: accountData.address,
          data: accountData,
          isCurrent: account && account.address === accountData.address, // 标记当前账户
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

/**
 * Persist config generator for Accounts
 */
export function createAccountsPersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
  rehydrationTracker.registerStore(config.name);

  return {
    name: config.name,
    storage: createJSONStorage(() => new AccountsStorage()),
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
 * Persist config generator for complete Account State (accounts + current account)
 */
export function createAccountStatePersistConfig<T>(config: PersistConfig<T>) {
  // Register this store with the rehydration tracker
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
