import { create } from 'zustand';
import { capKitService } from '@/shared/services/capkit-service';
import type { RemoteCap } from './types';
import { mapToRemoteCap } from './utils';

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

interface CapStoreState {
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

  // Favorite caps management
  favoriteCaps: RemoteCap[];
  isFetchingFavoriteCaps: boolean;
  favoriteCapsError: string | null;

  // Main actions
  fetchCaps: (params?: UseRemoteCapParams, append?: boolean) => Promise<any>;
  refetch: () => void;
  loadMore: () => Promise<any> | undefined;
  goToPage: (newPage: number) => Promise<any>;
  fetchHome: () => Promise<HomeData | null>;
  fetchFavoriteCaps: () => Promise<RemoteCap[]>;
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
  favoriteCaps: [],
  isFetchingFavoriteCaps: false,
  favoriteCapsError: null,
  isLoadingHome: false,
  homeError: null,
};

export const useCapStore = create<CapStoreState>()((set, get) => ({
  ...initialState,

  // Main fetch functions
  fetchCaps: async (params: UseRemoteCapParams = {}, append = false) => {
    const capKit = await capKitService.getCapKit();
    if (!capKit) {
      return;
    }

    const {
      searchQuery: queryString = '',
      page: pageNum = 0,
      size: sizeNum = 45,
      tags: tagsArray = [],
      sortBy: sortByParam = 'downloads',
      sortOrder: sortOrderParam = 'desc',
    } = params;

    if (append) {
      set({ isLoadingMore: true });
    } else {
      set({ currentPage: 0, isFetching: true, hasMoreData: true });
    }
    set({ error: null, lastSearchParams: params });

    try {
      const response = await capKit.queryByName(queryString, {
        tags: tagsArray,
        page: pageNum,
        size: sizeNum,
        sortBy: sortByParam,
        sortOrder: sortOrderParam,
      });

      const newRemoteCaps: RemoteCap[] = mapToRemoteCap(
        response.data?.items || [],
      );

      const totalItems = response.data?.items?.length || 0;
      const { remoteCaps } = get();

      set({
        hasMoreData: totalItems === sizeNum,
        remoteCaps: append ? [...remoteCaps, ...newRemoteCaps] : newRemoteCaps,
        currentPage: pageNum,
        isFetching: false,
        isLoadingMore: false,
      });

      return response;
    } catch (err) {
      console.error('Error fetching caps:', err);
      set({
        error: 'Please check your network connection and try again.',
        isFetching: false,
        isLoadingMore: false,
      });
      throw err;
    }
  },

  refetch: () => {
    const { lastSearchParams, fetchCaps } = get();
    fetchCaps(lastSearchParams);
  },

  loadMore: () => {
    const {
      hasMoreData,
      isLoadingMore,
      currentPage,
      lastSearchParams,
      fetchCaps,
    } = get();
    if (!hasMoreData || isLoadingMore) return;

    const nextPage = currentPage + 1;
    return fetchCaps(
      {
        ...lastSearchParams,
        page: nextPage,
      },
      true,
    );
  },

  goToPage: (newPage: number) => {
    const { fetchCaps } = get();
    return fetchCaps({
      searchQuery: '',
      page: newPage,
    });
  },

  fetchHome: async (): Promise<HomeData | null> => {
    const capKit = await capKitService.getCapKit();
    if (!capKit) {
      return null;
    }

    set({ isLoadingHome: true, homeError: null });

    try {
      const [topRatedResponse, trendingResponse, latestResponse] =
        await Promise.all([
          capKit.queryByName('', {
            sortBy: 'average_rating',
            sortOrder: 'desc',
            page: 0,
            size: 6,
          }),
          capKit.queryByName('', {
            sortBy: 'downloads',
            sortOrder: 'desc',
            page: 0,
            size: 6,
          }),
          capKit.queryByName('', {
            sortBy: 'updated_at',
            sortOrder: 'desc',
            page: 0,
            size: 6,
          }),
        ]);

      const homeData: HomeData = {
        topRated: mapToRemoteCap(topRatedResponse.data?.items || []),
        trending: mapToRemoteCap(trendingResponse.data?.items || []),
        latest: mapToRemoteCap(latestResponse.data?.items || []),
      };

      set({ homeData, isLoadingHome: false });
      return homeData;
    } catch (err) {
      console.error('Error fetching home data:', err);
      set({
        homeError: 'Failed to load home data. Please try again.',
        isLoadingHome: false,
      });
      throw err;
    }
  },

  fetchFavoriteCaps: async (): Promise<RemoteCap[]> => {
    const capKit = await capKitService.getCapKit();
    if (!capKit) {
      return [];
    }

    set({ isFetchingFavoriteCaps: true, favoriteCapsError: null });

    try {
      const response = await capKit.queryMyFavorite();
      const newFavoriteCaps: RemoteCap[] = mapToRemoteCap(
        response.data?.items || [],
      );
      set({ favoriteCaps: newFavoriteCaps, isFetchingFavoriteCaps: false });
      return newFavoriteCaps;
    } catch (err) {
      console.error('Error fetching favorite caps:', err);
      set({
        favoriteCapsError: 'Failed to fetch favorite caps. Please try again.',
        isFetchingFavoriteCaps: false,
      });
      throw err;
    }
  },
}));

// Keep the old export for backward compatibility
export const useRemoteCapStore = useCapStore;
export const useInstalledCapStore = useCapStore;
