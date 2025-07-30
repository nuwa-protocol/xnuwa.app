import { create } from 'zustand';
import type { Cap } from '@/shared/types';

export interface CurrentCap extends Cap {
  id: string;
  name: string;
}

interface CurrentCapState {
  currentCap: CurrentCap | null;
  setCurrentCap: (cap: CurrentCap | null) => void;
  clearCurrentCap: () => void;
}

export const CurrentCapStore = create<CurrentCapState>()((set) => ({
  currentCap: null,

  setCurrentCap: (cap: CurrentCap | null) => {
    set({ currentCap: cap });
  },

  clearCurrentCap: () => {
    set({ currentCap: null });
  },
}));
