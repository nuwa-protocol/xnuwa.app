// cap-store.ts
// Store for managing capability (Cap) installations and their states
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/shared/services/identity-kit';
import { createPersistConfig, db } from '@/shared/storage';
import type { Cap } from '@/shared/types/cap';

// ================= Interfaces ================= //

// Remote caps state interface
interface RemoteCapState {
  remoteCaps: Cap[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  hasMore: boolean;
  lastSearchQuery: string;
}

// Cap store state interface - handles both installed and remote caps
interface CapStoreState {
  installedCaps: Record<string, Cap>;

  // Remote caps state
  remoteCapState: RemoteCapState;

  // Installed cap management
  installCap: (cap: Cap) => void;
  uninstallCap: (id: string) => void;
  updateInstalledCap: (id: string, updatedCap: Cap) => void;

  // Remote caps management
  setRemoteCaps: (caps: Cap[]) => void;
  setRemoteCapLoading: (isLoading: boolean) => void;
  setRemoteCapError: (error: string | null) => void;
  setRemoteCapPagination: (pagination: {
    totalCount: number;
    page: number;
    hasMore: boolean;
  }) => void;
  setLastSearchQuery: (query: string) => void;
  clearRemoteCaps: () => void;

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

      // Remote caps state
      remoteCapState: {
        remoteCaps: [],
        isLoading: false,
        error: null,
        totalCount: 0,
        page: 1,
        hasMore: false,
        lastSearchQuery: '',
      },

      // Installation management
      installCap: (cap: Cap) => {
        const { installedCaps } = get();

        // Don't install if already installed
        if (installedCaps[cap.id]) {
          return;
        }

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [cap.id]: cap,
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

      // Remote caps management
      setRemoteCaps: (caps: Cap[]) => {
        set((state) => ({
          remoteCapState: {
            ...state.remoteCapState,
            remoteCaps: caps,
          },
        }));
      },

      setRemoteCapLoading: (isLoading: boolean) => {
        set((state) => ({
          remoteCapState: {
            ...state.remoteCapState,
            isLoading,
          },
        }));
      },

      setRemoteCapError: (error: string | null) => {
        set((state) => ({
          remoteCapState: {
            ...state.remoteCapState,
            error,
          },
        }));
      },

      setRemoteCapPagination: (pagination: {
        totalCount: number;
        page: number;
        hasMore: boolean;
      }) => {
        set((state) => ({
          remoteCapState: {
            ...state.remoteCapState,
            ...pagination,
          },
        }));
      },

      setLastSearchQuery: (query: string) => {
        set((state) => ({
          remoteCapState: {
            ...state.remoteCapState,
            lastSearchQuery: query,
          },
        }));
      },

      clearRemoteCaps: () => {
        set((state) => ({
          remoteCapState: {
            ...state.remoteCapState,
            remoteCaps: [],
            totalCount: 0,
            page: 1,
            hasMore: false,
          },
        }));
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
