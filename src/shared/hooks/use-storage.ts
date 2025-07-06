import {
  ChatStateStore,
  FileStateStore,
  MemoryStateStore,
} from '@/features/ai-chat/stores';
import { DocumentStateStore } from '@/features/documents/stores';
import { SettingsStateStore } from '@/features/settings/stores';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const useStorage = () => {
  // clear all client storage data, including:
  async function clearAllStorage() {
    if (!isBrowser) {
      return;
    }

    // reset all Zustand stores
    ChatStateStore.persist.clearStorage();
    SettingsStateStore.persist.clearStorage();
    FileStateStore.persist.clearStorage();
    DocumentStateStore.persist.clearStorage();
    MemoryStateStore.persist.clearStorage();

    // clear localStorage
    localStorage.clear();

    // clear IndexedDB
    const databases = await window.indexedDB.databases();
    for (const { name } of databases) {
      if (name) {
        window.indexedDB.deleteDatabase(name);
      }
    }

    // clear sessionStorage
    sessionStorage.clear();
  }

  // reset all stores for logging out
  const resetAllStores = () => {
    ChatStateStore.setState(ChatStateStore.getInitialState());
    SettingsStateStore.setState(SettingsStateStore.getInitialState());
    FileStateStore.setState(FileStateStore.getInitialState());
    DocumentStateStore.setState(DocumentStateStore.getInitialState());
    MemoryStateStore.setState(MemoryStateStore.getInitialState());
  };

  const initalizeAllStores = () => {
    ChatStateStore.persist.rehydrate();
    SettingsStateStore.persist.rehydrate();
    FileStateStore.persist.rehydrate();
    DocumentStateStore.persist.rehydrate();
    MemoryStateStore.persist.rehydrate();
  };

  return {
    clearAllStorage,
    resetAllStores,
    initalizeAllStores,
  };
};
