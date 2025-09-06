// cap-store.ts
// Store for managing capability (Cap) states
import { create } from 'zustand';
import { defaultCap } from '@/shared/constants/cap';
import type { InstalledCap, RemoteCap } from './types';

// Search parameters interface
export interface UseRemoteCapParams {
  searchQuery?: string;
  tags?: string[];
  page?: number;
  size?: number;
}

// ================= Interfaces ================= //

// Cap store state interface - handles both installed and remote caps
interface CapStoreState {
  // Installed cap management use capId as key
  installedCaps: Record<string, InstalledCap>;

  // Remote cap management
  remoteCaps: RemoteCap[];
  isFetching: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMoreData: boolean;
  currentPage: number;
  lastSearchParams: UseRemoteCapParams;

  // Installed Cap management
  addInstalledCap: (cap: InstalledCap) => void;
  updateInstalledCap: (
    id: string,
    updates: Partial<Omit<InstalledCap, 'capData'>>,
  ) => void;
  clearAllInstalledCaps: () => void;

  // Remote cap management
  setRemoteCaps: (caps: RemoteCap[]) => void;
  setIsFetching: (fetching: boolean) => void;
  setIsLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMoreData: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setLastSearchParams: (params: UseRemoteCapParams) => void;
}

// ================= Store Definition ================= //

export const CapStateStore = create<CapStoreState>()((set, get) => ({
  // Store state
  installedCaps: {
    [defaultCap.id]: {
      cid: defaultCap.id,
      capData: defaultCap,
      isFavorite: false,
      lastUsedAt: null,
    },
  },

  remoteCaps: [],
  isFetching: false,
  isLoadingMore: false,
  error: null,
  hasMoreData: true,
  currentPage: 0,
  lastSearchParams: {},

  // Installation management
  addInstalledCap: (cap: InstalledCap) => {
    const { installedCaps } = get();

    // Don't install if already installed
    if (installedCaps[cap.capData.id]) {
      return;
    }

    set((state) => ({
      installedCaps: {
        ...state.installedCaps,
        [cap.capData.id]: {
          cid: cap.cid,
          capData: cap.capData,
          isFavorite: cap.isFavorite,
          lastUsedAt: cap.lastUsedAt,
        },
      },
    }));
  },

  // Data management
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

  clearAllInstalledCaps: () => {
    set({
      installedCaps: {},
    });
  },

  // Remote cap management
  setRemoteCaps: (caps: RemoteCap[]) => {
    set({ remoteCaps: caps });
  },

  setIsFetching: (fetching: boolean) => {
    set({ isFetching: fetching });
  },

  setIsLoadingMore: (loading: boolean) => {
    set({ isLoadingMore: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setHasMoreData: (hasMore: boolean) => {
    set({ hasMoreData: hasMore });
  },

  setCurrentPage: (page: number) => {
    set({ currentPage: page });
  },

  setLastSearchParams: (params: UseRemoteCapParams) => {
    set({ lastSearchParams: params });
  },
}));
