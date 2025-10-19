// settings-store.ts
// Store for managing user settings and UI preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createLocalStoragePersistConfig } from '@/shared/storage';
import type { UserMCPOAuth, UserSettings } from './types';

// ================= Interfaces ================= //

// settings interface
interface SettingsState {
  // grouped user settings
  settings: UserSettings;
  userMCPOAuths: UserMCPOAuth[];
  setSettings: (settings: UserSettings) => void;
  setSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => void;
  addUserMCPOAuth: (oauth: Omit<UserMCPOAuth, 'updatedAt'>) => void;
  removeUserMCPOAuth: (resource: string) => void;

  // reset settings
  resetSettings: () => void;
}

// ================= Persist Configuration ================= //

const persistConfig = createLocalStoragePersistConfig<SettingsState>({
  name: 'settings-storage',
  partialize: (state) => ({
    settings: state.settings,
    mcpOAuths: state.userMCPOAuths,
  }),
});

// ================= Store Definition ================= //

export const SettingsStateStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // User settings
      settings: {
        language: 'en',
        name: '',
        avatar: null,
        devMode: false,
      },
      userMCPOAuths: [],
      setSettings: (settings: UserSettings) => {
        set({ settings });
      },
      setSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },
      addUserMCPOAuth: (oauth: Omit<UserMCPOAuth, 'updatedAt'>) => {
        set((state) => {
          console.log('addUserMCPOAuth', oauth);
          return {
            userMCPOAuths: [
              ...state.userMCPOAuths,
              { ...oauth, updatedAt: Date.now() },
            ],
          };
        });
      },
      removeUserMCPOAuth: (resource: string) => {
        set((state) => ({
          userMCPOAuths: state.userMCPOAuths.filter(
            (item) => item.resource !== resource,
          ),
        }));
      },

      // Reset functionality
      resetSettings: () => {
        set({
          settings: {
            language: 'en',
            name: '',
            avatar: null,
            devMode: false,
          },
          userMCPOAuths: [],
        });
      },
    }),
    persistConfig,
  ),
);
