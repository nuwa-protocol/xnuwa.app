import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { defaultCap } from '@/shared/constants/cap';
import { createCapStorePersistConfig } from '@/shared/storage/indexeddb-config';
import type { InstalledCap } from '../types';

interface InstalledCapStoreState {
  // Installed cap management - use capId as key
  installedCaps: Record<string, InstalledCap>;

  // Actions
  addInstalledCap: (cap: InstalledCap) => void;
  updateInstalledCap: (
    id: string,
    updates: Partial<Omit<InstalledCap, 'capData'>>,
  ) => void;
  removeInstalledCap: (id: string) => void;
  clearAllInstalledCaps: () => void;
  getInstalledCap: (id: string) => InstalledCap | undefined;
  isCapInstalled: (id: string) => boolean;
}

export const useInstalledCapStore = create<InstalledCapStoreState>()(
  persist(
    (set, get) => ({
      // Store state - Initialize with default cap
      installedCaps: {
        [defaultCap.id]: {
          cid: defaultCap.id,
          capData: defaultCap,
          isFavorite: false,
          version: '0',
          stats: {
            capId: defaultCap.id,
            downloads: 0,
            ratingCount: 0,
            averageRating: 0,
            favorites: 0,
          },
          lastUsedAt: null,
        },
      },

      // Actions
      addInstalledCap: (cap: InstalledCap) => {
        const { installedCaps } = get();

        // Don't install if already installed
        if (installedCaps[cap.capData.id]) {
          return;
        }

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [cap.capData.id]: cap,
          },
        }));
      },

      updateInstalledCap: (
        id: string,
        updates: Partial<Omit<InstalledCap, 'capData'>>,
      ) => {
        const { installedCaps } = get();
        const installedCap = installedCaps[id];

        if (!installedCap) return;

        set((state) => ({
          installedCaps: {
            ...state.installedCaps,
            [id]: {
              ...installedCap,
              ...updates,
            },
          },
        }));
      },

      removeInstalledCap: (id: string) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.installedCaps;
          return {
            installedCaps: rest,
          };
        });
      },

      clearAllInstalledCaps: () => {
        set({
          installedCaps: {},
        });
      },

      getInstalledCap: (id: string) => {
        return get().installedCaps[id];
      },

      isCapInstalled: (id: string) => {
        return !!get().installedCaps[id];
      },
    }),
    createCapStorePersistConfig({
      name: 'installed-cap-store',
      partialize: (state) => ({
        installedCaps: state.installedCaps,
      }),
    }),
  ),
);