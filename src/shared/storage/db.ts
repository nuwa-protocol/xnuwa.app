import Dexie, { type Table } from 'dexie';

export interface ChatSessionRecord {
  chatId: string;
  did: string;
  data: any;
  updatedAt: number;
}

export interface CapStudioRecord {
  id: string;
  did: string;
  data: any;
  updatedAt: number;
}

export interface CapStoreRecord {
  capId: string;
  did: string;
  data: any;
  updatedAt: number;
}

class Database extends Dexie {
  chatSessions!: Table<ChatSessionRecord>;
  capStudio!: Table<CapStudioRecord>;
  capStore!: Table<CapStoreRecord>;

  constructor() {
    if (typeof window === 'undefined') {
      super('dummy');
      return;
    }

    super('NuwaClientDB');

    // Schema with separate tables for ChatSessions and CapStudio
    this.version(1).stores({
      chatSessions: '[chatId+did], chatId, did, updatedAt',
      capStudio: '[id+did], id, did, updatedAt',
      capStore: '[capId+did], capId, did, updatedAt',
    });
  }
}

export const db = new Database();
