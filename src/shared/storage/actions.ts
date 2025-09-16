import { db } from './db';

class StorageActions {
  private isBrowser = typeof window !== 'undefined';

  // Clear all storage
  async clearAllStorage(): Promise<void> {
    if (!this.isBrowser) return;

    try {
      // Clear IndexedDB - both chatSessions and capStudio tables
      await db.transaction('rw', [db.chatSessions, db.capStudio], async () => {
        await db.chatSessions.clear();
        await db.capStudio.clear();
      });

      // Clear localStorage for any remaining settings
      const keysToRemove = Object.keys(localStorage).filter(
        (key) => key.includes('storage') || key.includes('nuwa'),
      );
      keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear all storage:', error);
    }
  }
}

export const storageActions = new StorageActions();
