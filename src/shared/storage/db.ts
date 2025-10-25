import Dexie, { type Table } from 'dexie';

export interface ChatSessionRecord {
  chatId: string;
  address: string;
  data: any;
  updatedAt: number;
}

export interface CapStudioRecord {
  id: string;
  address: string;
  data: any;
  updatedAt: number;
}

export interface ArtifactRecord {
  id: string;
  address: string;
  data: any;
  updatedAt: number;
}

export interface InstalledCapRecord {
  id: string;
  address: string;
  data: any; // Full Cap object
  updatedAt: number;
}

export interface AccountRecord {
  address: string;
  data: any; // AccountData object
  isCurrent?: boolean; // 标记是否为当前选中的账户
  updatedAt: number;
}

class Database extends Dexie {
  chatSessions!: Table<ChatSessionRecord>;
  capStudio!: Table<CapStudioRecord>;
  artifacts!: Table<ArtifactRecord>;
  installedCaps!: Table<InstalledCapRecord>;
  accounts!: Table<AccountRecord>;

  constructor() {
    if (typeof window === 'undefined') {
      super('dummy');
      return;
    }

    super('NuwaClientDB');

    // v5: switch identity keying from DID to account address
    this.version(1).stores({
      chatSessions: '[chatId+address], chatId, address, updatedAt',
      capStudio: '[id+address], id, address, updatedAt',
      artifacts: '[id+address], id, address, updatedAt',
      installedCaps: '[id+address], id, address, updatedAt',
      accounts: 'address, isCurrent, updatedAt',
    });
  }
}

export const db = new Database();
