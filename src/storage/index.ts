// lib/storage/index.ts
// 统一存储管理器 - 实现三层存储架构：状态层 ↔ localStorage缓存层 ↔ IndexedDB存储层

import Dexie, { type Table } from 'dexie';
import { createJSONStorage } from 'zustand/middleware';

// ================= 类型定义 ================= //

export interface StorageConfig {
  name: string;
  version: number;
  stores: Record<string, string>;
}

export interface PersistConfig<T> {
  name: string;
  getCurrentDID: () => Promise<string | null>;
  partialize?: (state: T) => Partial<T>;
  onRehydrateStorage?: () => (state?: T | undefined) => void;
}

// ================= 统一数据库 ================= //

class UnifiedDatabase extends Dexie {
  // 业务表
  chats!: Table<any>;
  documents!: Table<any>;
  files!: Table<any>;
  fileData!: Table<{ id: string; blob: Blob }>;
  streams!: Table<any>;
  caps!: Table<any>;
  settings!: Table<any>;

  constructor() {
    if (typeof window === 'undefined') {
      super('dummy');
      return;
    }

    super('NuwaAssistantDB');

    this.version(1).stores({
      chats: 'id, did, createdAt, updatedAt',
      documents: 'id, did, createdAt, updatedAt',
      files: 'id, did, createdAt, updatedAt',
      fileData: 'id',
      streams: 'id, did, chatId, createdAt',
      caps: 'id, did, installDate, tag',
      settings: 'did',
    });
  }
}

export const unifiedDB = new UnifiedDatabase();

// ================= 存储管理器 ================= //

class StorageManager {
  private isBrowser = typeof window !== 'undefined';

  // 同步状态到localStorage缓存
  async syncToCache<T>(key: string, data: T): Promise<void> {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to sync to cache [${key}]:`, error);
    }
  }

  // 从localStorage缓存读取
  async syncFromCache<T>(key: string): Promise<T | null> {
    if (!this.isBrowser) return null;

    try {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error(`Failed to sync from cache [${key}]:`, error);
      return null;
    }
  }

  // 保存到IndexedDB存储层
  async saveToStorage<T extends { id: string; did: string }>(
    table: string,
    records: T[],
  ): Promise<void> {
    if (!this.isBrowser || records.length === 0) return;

    try {
      const dbTable = (unifiedDB as any)[table];
      if (dbTable) {
        await dbTable.bulkPut(records);
      }
    } catch (error) {
      console.error(`Failed to save to storage [${table}]:`, error);
    }
  }

  // 从IndexedDB存储层加载
  async loadFromStorage<T>(table: string, did: string): Promise<T[]> {
    if (!this.isBrowser || !did) return [];

    try {
      const dbTable = (unifiedDB as any)[table];
      if (dbTable) {
        const records = await dbTable.where('did').equals(did).toArray();
        return records.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
      }
      return [];
    } catch (error) {
      console.error(`Failed to load from storage [${table}]:`, error);
      return [];
    }
  }

  // 从IndexedDB删除记录
  async deleteFromStorage(
    table: string,
    condition: string | { key: string; value: any },
  ): Promise<void> {
    if (!this.isBrowser) return;

    try {
      const dbTable = (unifiedDB as any)[table];
      if (dbTable) {
        if (typeof condition === 'string') {
          await dbTable.delete(condition);
        } else {
          await dbTable.where(condition.key).equals(condition.value).delete();
        }
      }
    } catch (error) {
      console.error(`Failed to delete from storage [${table}]:`, error);
    }
  }

  // 清理所有存储
  async clearAllStorage(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      // 清理IndexedDB
      await unifiedDB.transaction(
        'rw',
        [
          unifiedDB.chats,
          unifiedDB.documents,
          unifiedDB.files,
          unifiedDB.fileData,
          unifiedDB.streams,
          unifiedDB.caps,
          unifiedDB.settings,
        ],
        async () => {
          await Promise.all([
            unifiedDB.chats.clear(),
            unifiedDB.documents.clear(),
            unifiedDB.files.clear(),
            unifiedDB.fileData.clear(),
            unifiedDB.streams.clear(),
            unifiedDB.caps.clear(),
            unifiedDB.settings.clear(),
          ]);
        },
      );

      // 清理localStorage
      const keysToRemove = Object.keys(localStorage).filter(
        (key) => key.includes('storage') || key.includes('nuwa'),
      );
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear all storage:', error);
    }
  }
}

export const storageManager = new StorageManager();

// ================= 辅助函数 ================= //

/**
 * 创建带DID的存储key
 */
export function createStorageKey(baseKey: string, did: string | null): string {
  return did ? `${baseKey}-${did}` : baseKey;
}

/**
 * 创建统一的persist存储适配器
 */
export function createPersistStorage<T>(config: PersistConfig<T>) {
  return {
    getItem: async (name: string): Promise<string | null> => {
      const did = await config.getCurrentDID();
      const key = createStorageKey(config.name, did);
      const data = await storageManager.syncFromCache<T>(key);
      return data ? JSON.stringify(data) : null;
    },

    setItem: async (name: string, value: string): Promise<void> => {
      const did = await config.getCurrentDID();
      const key = createStorageKey(config.name, did);
      const data = JSON.parse(value);
      await storageManager.syncToCache(key, data);
    },

    removeItem: async (name: string): Promise<void> => {
      const did = await config.getCurrentDID();
      const key = createStorageKey(config.name, did);
      await storageManager.syncToCache(key, null);
    },
  };
}

/**
 * 标准persist配置生成器
 */
export function createPersistConfig<T>(config: PersistConfig<T>) {
  return {
    name: config.name,
    storage: createJSONStorage(() => createPersistStorage(config)),
    partialize: config.partialize,
    onRehydrateStorage: config.onRehydrateStorage,
  };
}
