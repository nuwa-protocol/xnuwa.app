import { ChatSessionsStore } from '@/features/chat/stores';
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
    ChatSessionsStore.persist.clearStorage();
    SettingsStateStore.persist.clearStorage();

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
    ChatSessionsStore.setState(ChatSessionsStore.getInitialState());
    SettingsStateStore.setState(SettingsStateStore.getInitialState());
  };

  const initalizeAllStores = () => {
    ChatSessionsStore.persist.rehydrate();
    SettingsStateStore.persist.rehydrate();
  };

  return {
    clearAllStorage,
    resetAllStores,
    initalizeAllStores,
  };
};
