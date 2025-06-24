// cap-store.ts
// Store for managing capability (Cap) installations and their states
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NuwaIdentityKit } from "@/features/auth/services";
import { createPersistConfig, db } from "@/storage";
import type { InstalledCap } from "../types";

// ================= Interfaces ================= //

// Cap store state interface - only handles installed caps
interface CapStoreState {
  installedCaps: Record<string, InstalledCap>;

  // Installed cap management
  getInstalledCap: (id: string) => InstalledCap | null;
  getAllInstalledCaps: () => InstalledCap[];
  getInstalledCapsByCategory: (category: string) => InstalledCap[];

  // Cap actions
  installCap: (
    cap: Omit<InstalledCap, "installDate" | "isEnabled" | "did">
  ) => void;
  uninstallCap: (id: string) => void;
  isCapInstalled: (id: string) => boolean;

  // Cap state management
  enableCap: (id: string) => void;
  disableCap: (id: string) => void;
  isCapEnabled: (id: string) => boolean;
  updateCapSettings: (id: string, settings: Record<string, any>) => void;

  // Data management
  updateInstalledCap: (id: string, updates: Partial<InstalledCap>) => void;
  clearAllInstalledCaps: () => void;

  // Utility
  getInstalledCapCount: () => number;
  getInstalledCapsByInstallDate: () => InstalledCap[];

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
  name: "cap-storage",
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

      // Cap retrieval methods
      getInstalledCap: (id: string) => {
        const { installedCaps } = get();
        return installedCaps[id] || null;
      },

      getAllInstalledCaps: () => {
        const { installedCaps } = get();
        return Object.values(installedCaps).sort(
          (a, b) => b.installDate - a.installDate
        );
      },

      getInstalledCapsByCategory: (category: string) => {
        const { installedCaps } = get();
        const allCaps = Object.values(installedCaps);

        if (category === "all") {
          return allCaps.sort((a, b) => b.installDate - a.installDate);
        }

        return allCaps
          .filter((cap) => cap.tag === category)
          .sort((a, b) => b.installDate - a.installDate);
      },

      // Installation management
      installCap: (
        cap: Omit<InstalledCap, "installDate" | "isEnabled" | "did">
      ) => {
        const { installedCaps } = get();

        // Don't install if already installed
        if (installedCaps[cap.id]) {
          return;
        }

        const newInstalledCap: InstalledCap = {
          ...cap,
          installDate: Date.now(),
          isEnabled: true,
          settings: {},
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
            console.error("Failed to delete cap from DB:", error);
          }
        };
        deleteFromDB();
      },

      isCapInstalled: (id: string) => {
        const { installedCaps } = get();
        return id in installedCaps;
      },

      // Cap state management
      enableCap: (id: string) => {
        const { installedCaps } = get();
        const cap = installedCaps[id];

        if (!cap) return;

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: { ...cap, isEnabled: true },
          },
        }));

        get().saveToDB();
      },

      disableCap: (id: string) => {
        const { installedCaps } = get();
        const cap = installedCaps[id];

        if (!cap) return;

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: { ...cap, isEnabled: false },
          },
        }));

        get().saveToDB();
      },

      isCapEnabled: (id: string) => {
        const { installedCaps } = get();
        const cap = installedCaps[id];
        return cap?.isEnabled ?? false;
      },

      // Settings management
      updateCapSettings: (id: string, settings: Record<string, any>) => {
        const { installedCaps } = get();
        const cap = installedCaps[id];

        if (!cap) return;

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: {
              ...cap,
              settings: { ...cap.settings, ...settings },
            },
          },
        }));

        get().saveToDB();
      },

      // Data management
      updateInstalledCap: (id: string, updates: Partial<InstalledCap>) => {
        const { installedCaps } = get();
        const cap = installedCaps[id];

        if (!cap) return;

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: { ...cap, ...updates },
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

            await capDB.caps.where("did").equals(currentDID).delete();
          } catch (error) {
            console.error("Failed to clear caps from DB:", error);
          }
        };
        clearDB();
      },

      // Utility methods
      getInstalledCapCount: () => {
        const { installedCaps } = get();
        return Object.keys(installedCaps).length;
      },

      getInstalledCapsByInstallDate: () => {
        const { installedCaps } = get();
        return Object.values(installedCaps).sort(
          (a, b) => b.installDate - a.installDate
        );
      },

      // Data persistence methods
      loadFromDB: async () => {
        if (typeof window === "undefined") return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const caps = await capDB.caps
            .where("did")
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
          console.error("Failed to load caps from DB:", error);
        }
      },

      saveToDB: async () => {
        if (typeof window === "undefined") return;

        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;

          const { installedCaps } = get();
          const capsToSave = Object.values(installedCaps);
          await capDB.caps.bulkPut(capsToSave);
        } catch (error) {
          console.error("Failed to save caps to DB:", error);
        }
      },
    }),
    persistConfig
  )
);
