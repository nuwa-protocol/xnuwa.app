import { create } from 'zustand';
import type { RemoteCap } from '../types';

// Search parameters interface
export interface UseRemoteCapParams {
  searchQuery?: string;
  tags?: string[];
  page?: number;
  size?: number;
  sortBy?:
    | 'average_rating'
    | 'downloads'
    | 'favorites'
    | 'rating_count'
    | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

interface RemoteCapStoreState {
  // Remote cap management
  remoteCaps: RemoteCap[];
  isFetching: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMoreData: boolean;
  currentPage: number;
  lastSearchParams: UseRemoteCapParams;

  // Actions
  setRemoteCaps: (caps: RemoteCap[]) => void;
  appendRemoteCaps: (caps: RemoteCap[]) => void;
  setIsFetching: (fetching: boolean) => void;
  setIsLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMoreData: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setLastSearchParams: (params: UseRemoteCapParams) => void;
  resetState: () => void;
  getRemoteCapById: (id: string) => RemoteCap | undefined;
}

const initialState = {
  remoteCaps: [],
  isFetching: false,
  isLoadingMore: false,
  error: null,
  hasMoreData: true,
  currentPage: 1,
  lastSearchParams: {},
};

export const useRemoteCapStore = create<RemoteCapStoreState>((set, get) => ({
  ...initialState,

  // Actions
  setRemoteCaps: (caps: RemoteCap[]) => {
    set({ remoteCaps: caps });
  },

  appendRemoteCaps: (caps: RemoteCap[]) => {
    set((state) => ({
      remoteCaps: [...state.remoteCaps, ...caps],
    }));
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

  resetState: () => {
    set(initialState);
  },

  getRemoteCapById: (id: string) => {
    return get().remoteCaps.find((cap) => cap.id === id);
  },
}));