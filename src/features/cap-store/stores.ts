// cap-store.ts
// Store for managing capability (Cap) installations and their states
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { createPersistConfig, db } from '@/shared/storage';
import type { Cap } from '@/shared/types/cap';

// ================= Interfaces ================= //

// Cap store state interface - only handles installed caps
interface CapStoreState {
  installedCaps: Record<string, Cap>;

  // Installed cap management
  installCap: (cap: Cap) => void;
  uninstallCap: (id: string) => void;
  updateInstalledCap: (id: string, updatedCap: Cap) => void;

  // Data management
  clearAllInstalledCaps: () => void;

  // Data persistence
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
}

// ================= Constants ================= //

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

// Database reference
const capDB = db;

// ================= Persist Configuration ================= //

const persistConfig = createPersistConfig<CapStoreState>({
  name: 'cap-storage',
  getCurrentDID: getCurrentDID,
  partialize: (state) => ({
    installedCaps: state.installedCaps,
  }),
  onRehydrateStorage: () => (state?: CapStoreState) => {
    if (state) {
      state.loadFromDB();
    }
  },
});

// ================= Store Definition ================= //

export const CapStateStore = create<CapStoreState>()(
  persist(
    (set, get) => ({
      // Store state
      installedCaps: {},

      // Installation management
      installCap: (cap: Cap) => {
        const { installedCaps } = get();

        // Don't install if already installed
        if (installedCaps[cap.idName]) {
          return;
        }

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [cap.idName]: cap,
          },
        }));

        // Save to IndexedDB asynchronously
        get().saveToDB();
      },

      uninstallCap: (id: string) => {
        set((state) => {
          const { [id]: removed, ...restCaps } = state.installedCaps;
          return {
            installedCaps: restCaps,
          };
        });

        // Delete from IndexedDB asynchronously
        const deleteFromDB = async () => {
          try {
            await capDB.caps.delete(id);
          } catch (error) {
            console.error('Failed to delete cap from DB:', error);
          }
        };
        deleteFromDB();
      },

      // Data management
      updateInstalledCap: (id: string, updatedCap: Cap) => {
        const { installedCaps } = get();
        const cap = installedCaps[id];

        if (!cap) return;

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: updatedCap,
          },
        }));

        get().saveToDB();
      },

      clearAllInstalledCaps: () => {
        set({
          installedCaps: {},
        });

        // Clear IndexedDB
        const clearDB = async () => {
          try {
            const currentDID = await getCurrentDID();
            if (!currentDID) return;

            await capDB.caps.where('did').equals(currentDID).delete();
          } catch (error) {
            console.error('Failed to clear caps from DB:', error);
          }
        };
        clearDB();
      },

      // Data persistence methods
      loadFromDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const caps = await capDB.caps
            .where('did')
            .equals(currentDID)
            .toArray();

          const capsMap: Record<string, Cap> = {};

          caps.forEach((cap: Cap) => {
            capsMap[cap.idName] = cap;
          });

          set((state) => ({
            installedCaps: { ...state.installedCaps, ...capsMap },
          }));
        } catch (error) {
          console.error('Failed to load caps from DB:', error);
        }
      },

      saveToDB: async () => {
        if (typeof window === 'undefined') return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const { installedCaps } = get();
          const capsToSave = Object.values(installedCaps).map((cap) => ({
            ...cap,
            did: currentDID,
          }));
          await capDB.caps.bulkPut(capsToSave);
        } catch (error) {
          console.error('Failed to save caps to DB:', error);
        }
      },
    }),
    persistConfig,
  ),
);
