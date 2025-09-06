// settings-store.ts
// Store for managing user settings and UI preferences

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Locale } from '@/shared/locales';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { createLocalStoragePersistConfig } from '@/shared/storage';

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

// ================= Interfaces ================= //

// user settings interface
interface UserSettings {
  language: Locale;
  name: string;
  avatar: string | null;
  devMode: boolean;
}

// settings interface
interface SettingsState {
  // grouped user settings
  settings: UserSettings;
  setSettings: (settings: UserSettings) => void;
  setSetting: <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => void;

  // reset settings
  resetSettings: () => void;
}

// ================= Persist Configuration ================= //

const persistConfig = createLocalStoragePersistConfig<SettingsState>({
  name: 'settings-storage',
  partialize: (state) => ({
    settings: state.settings,
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

      // Reset functionality
      resetSettings: () => {
        set({
          settings: {
            language: 'en',
            name: '',
            avatar: null,
            devMode: false,
          },
        });
      },
    }),
    persistConfig,
  ),
);
