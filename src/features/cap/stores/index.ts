// cap-store.ts
// Store for managing capability (Cap) installations and their states
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/features/auth/services';
import { createPersistConfig, db } from '@/storage';
import type { InstalledCap, RemoteCap } from '../types';

// ================= Interfaces ================= //

// Cap store state interface - only handles installed caps
interface CapStoreState {
  installedCaps: Record<string, InstalledCap>;
  currentCap: InstalledCap | null;

  // Current cap management
  setCurrentCap: (id: string | null) => void;
  
  // Installed cap management
  installCap: (cap: RemoteCap) => void;
  uninstallCap: (id: string) => void;
  updateInstalledCap: (id: string, updatedCap: RemoteCap) => void;
  
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
    currentCap: state.currentCap,
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
      currentCap: null,

      // Current cap management
      setCurrentCap: (id: string | null) => {
        const { installedCaps } = get();
        if (id && installedCaps[id]) {
          set({ currentCap: installedCaps[id] });
        } else {
          set({ currentCap: null });
        }
      },


      // Installation management
      installCap: (
        cap: RemoteCap,
      ) => {
        const { installedCaps } = get();

        // Don't install if already installed
        if (installedCaps[cap.id]) {
          return;
        }

        const newInstalledCap: InstalledCap = {
          ...cap,
          updatedAt: Date.now(),
        };

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [cap.id]: newInstalledCap,
          },
        }));

        // Save to IndexedDB asynchronously
        get().saveToDB();
      },

      uninstallCap: (id: string) => {
        const { currentCap } = get();
        
        set((state) => {
          const { [id]: removed, ...restCaps } = state.installedCaps;
          return {
            installedCaps: restCaps,
            // Clear currentCap if uninstalling the current cap
            currentCap: currentCap?.id === id ? null : state.currentCap,
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
      updateInstalledCap: (id: string, updatedCap: RemoteCap) => {
        const { installedCaps, currentCap } = get();
        const cap = installedCaps[id];

        if (!cap) return;

        const newInstalledCap: InstalledCap = {
          ...updatedCap,
          updatedAt: Date.now(),
        };

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: newInstalledCap,
          },
          // Update currentCap if updating the current cap
          currentCap: currentCap?.id === id ? newInstalledCap : state.currentCap,
        }));

        get().saveToDB();
      },

      clearAllInstalledCaps: () => {
        set({
          installedCaps: {},
          currentCap: null,
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

          const capsMap: Record<string, InstalledCap> = {};

          caps.forEach((cap: InstalledCap) => {
            capsMap[cap.id] = cap;
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
          const capsToSave = Object.values(installedCaps);
          await capDB.caps.bulkPut(capsToSave);
        } catch (error) {
          console.error('Failed to save caps to DB:', error);
        }
      },
    }),
    persistConfig,
  ),
);
