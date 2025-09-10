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

// Home data structure
export interface HomeData {
  topRated: RemoteCap[];
  trending: RemoteCap[];
  latest: RemoteCap[];
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

  // Home data management
  homeData: HomeData;
  isLoadingHome: boolean;
  homeError: string | null;

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

  // Home data actions
  setHomeData: (homeData: HomeData) => void;
  setIsLoadingHome: (loading: boolean) => void;
  setHomeError: (error: string | null) => void;
}

const initialState = {
  remoteCaps: [],
  isFetching: false,
  isLoadingMore: false,
  error: null,
  hasMoreData: true,
  currentPage: 1,
  lastSearchParams: {},
  homeData: {
    topRated: [],
    trending: [],
    latest: [],
  },
  isLoadingHome: false,
  homeError: null,
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

  // Home data actions
  setHomeData: (homeData: HomeData) => {
    set({ homeData });
  },

  setIsLoadingHome: (loading: boolean) => {
    set({ isLoadingHome: loading });
  },

  setHomeError: (error: string | null) => {
    set({ homeError: error });
  },
}));