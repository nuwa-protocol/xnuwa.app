import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Model } from '@/shared/types/model';

export interface LocalCap {
  id: string;
  name: string;
  description: string;
  tag: string;
  version: string;
  prompt: string;
  model: Model;
  mcpServers: Record<string, { url: string }>;
  createdAt: number;
  updatedAt: number;
}

interface CapDevState {
  // Local caps being developed
  localCaps: LocalCap[];
  
  // Currently selected cap for editing
  selectedCap: LocalCap | null;
  
  // Actions
  createCap: (cap: Omit<LocalCap, 'id' | 'createdAt' | 'updatedAt'>) => LocalCap;
  updateCap: (id: string, updates: Partial<LocalCap>) => void;
  deleteCap: (id: string) => void;
  selectCap: (cap: LocalCap | null) => void;
  duplicateCap: (id: string) => LocalCap | null;
  
  // Utility functions
  getCapById: (id: string) => LocalCap | undefined;
  getCapsByTag: (tag: string) => LocalCap[];
}

export const useCapDevStore = create<CapDevState>()(
  persist(
    (set, get) => ({
      localCaps: [],
      selectedCap: null,

      createCap: (capData) => {
        const newCap: LocalCap = {
          ...capData,
          id: `local_cap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
            cap.id === id
              ? { ...cap, ...updates, updatedAt: Date.now() }
              : cap
          ),
          selectedCap:
            state.selectedCap?.id === id
              ? { ...state.selectedCap, ...updates, updatedAt: Date.now() }
              : state.selectedCap,
        }));
      },

      deleteCap: (id) => {
        set((state) => ({
          localCaps: state.localCaps.filter((cap) => cap.id !== id),
          selectedCap: state.selectedCap?.id === id ? null : state.selectedCap,
        }));
      },

      selectCap: (cap) => {
        set({ selectedCap: cap });
      },

      duplicateCap: (id) => {
        const cap = get().getCapById(id);
        if (!cap) return null;

        const duplicatedCap = get().createCap({
          ...cap,
          name: `${cap.name} (Copy)`,
          version: '1.0.0', // Reset version for the copy
        });

        return duplicatedCap;
      },

      getCapById: (id) => {
        return get().localCaps.find((cap) => cap.id === id);
      },

      getCapsByTag: (tag) => {
        return get().localCaps.filter((cap) => cap.tag === tag);
      },
    }),
    {
      name: 'cap-dev-storage',
      // Only persist the caps, not the selected state
      partialize: (state) => ({ localCaps: state.localCaps }),
    }
  )
);