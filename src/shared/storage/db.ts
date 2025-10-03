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

export interface ArtifactRecord {
  id: string;
  did: string;
  data: any;
  updatedAt: number;
}

export interface InstalledCapRecord {
  id: string;
  did: string;
  data: any; // Full Cap object
  updatedAt: number;
}

class Database extends Dexie {
  chatSessions!: Table<ChatSessionRecord>;
  capStudio!: Table<CapStudioRecord>;
  artifacts!: Table<ArtifactRecord>;
  installedCaps!: Table<InstalledCapRecord>;

  constructor() {
    if (typeof window === 'undefined') {
      super('dummy');
      return;
    }

    super('NuwaClientDB');

    // v1: original schema without installedCaps
    this.version(1).stores({
      chatSessions: '[chatId+did], chatId, did, updatedAt',
      capStudio: '[id+did], id, did, updatedAt',
      artifacts: '[id+did], id, did, updatedAt',
    });

    // v2: add installedCaps table
    this.version(2).stores({
      chatSessions: '[chatId+did], chatId, did, updatedAt',
      capStudio: '[id+did], id, did, updatedAt',
      artifacts: '[id+did], id, did, updatedAt',
      installedCaps: '[id+did], id, did, updatedAt',
    });
  }
}

export const db = new Database();
