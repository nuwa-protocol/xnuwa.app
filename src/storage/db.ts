import Dexie, { type Table } from 'dexie';

class Database extends Dexie {
  chats!: Table<any>;
  documents!: Table<any>;
  files!: Table<any>;
  fileData!: Table<{ id: string; blob: Blob }>;
  streams!: Table<any>;
  caps!: Table<any>;
  settings!: Table<any>;
  models!: Table<any>;

  constructor() {
    if (typeof window === 'undefined') {
      super('dummy');
      return;
    }

    super('NuwaClientDB');

    this.version(1).stores({
      chats: 'id, did, createdAt, updatedAt',
      documents: 'id, did, createdAt, updatedAt',
      files: 'id, did, createdAt, updatedAt',
      fileData: 'id',
      streams: 'id, did, chatId, createdAt',
      caps: 'id, did, installDate, tag',
      settings: 'did',
      models: 'did',
    });
  }
}

export const db = new Database();
