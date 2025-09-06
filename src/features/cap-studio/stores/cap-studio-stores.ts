import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createCapStudioPersistConfig } from '@/shared/storage';
import type { Cap } from '@/shared/types';
import { generateUUID } from '@/shared/utils';
import type { LocalCap } from '../types';

interface CapStudioState {
  // Local caps being developed
  localCaps: LocalCap[];

  // Actions
  createCap: (capData: Cap) => LocalCap;
  updateCap: (id: string, updates: Partial<LocalCap>) => void;
  deleteCap: (id: string) => void;

  // Utility functions
  getCapById: (id: string) => LocalCap | undefined;
  getCapsByTag: (tag: string) => LocalCap[];
  clearAllCaps: () => void;
}

const persistConfig = createCapStudioPersistConfig<CapStudioState>({
  name: 'cap-studio-storage',
  partialize: (state) => ({
    localCaps: state.localCaps,
  }),
});

export const CapStudioStore = create<CapStudioState>()(
  persist(
    (set, get) => ({
      localCaps: [],

      createCap: (capData) => {
        const newCap: LocalCap = {
          capData,
          id: generateUUID(),
          status: 'draft',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          localCaps: [...state.localCaps, newCap],
        }));

        return newCap;
      },

      updateCap: (id, updates) => {
        set((state) => ({
          localCaps: state.localCaps.map((cap) =>
            cap.id === id ? { ...cap, ...updates, updatedAt: Date.now() } : cap,
          ),
        }));
      },

      deleteCap: (id) => {
        set((state) => ({
          localCaps: state.localCaps.filter((cap) => cap.id !== id),
        }));
      },

      getCapById: (id) => {
        return get().localCaps.find((cap) => cap.id === id);
      },

      getCapsByTag: (tag) => {
        return get().localCaps.filter((cap) =>
          cap.capData.metadata.tags.includes(tag),
        );
      },

      clearAllCaps: () => {
        set({
          localCaps: [],
        });
      },
    }),
    persistConfig,
  ),
);
