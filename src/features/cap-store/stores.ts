import type { Cap } from '@nuwa-ai/cap-kit';
import { create } from 'zustand';
import { capKitService } from '@/shared/services/capkit-service';
import { agent8004ToRemoteCap } from './8004-remotecap-adapter';
import {
  DEFAULT_IDENTITY_REGISTRY_ADDRESS,
  getAgent8004ByPage,
  getAgentsByPage,
  getOwnerAddressesByAgentIds,
} from './8004-service';
import type { CapStoreSection, RemoteCap } from './types';

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
  // UI State (from context)
  isInitialized: boolean;

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

  //downloaded caps management
  downloadedCaps: Record<string, Cap>;

  // UI Actions (from context)
  initialize: () => Promise<void>;

  // Main actions
  fetchCaps: (
    params?: UseRemoteCapParams,
    append?: boolean,
  ) => Promise<RemoteCap[]>;
  refetch: () => void;
  loadMore: () => Promise<any> | undefined;
  goToPage: (newPage: number) => Promise<any>;
  fetchHome: () => Promise<HomeData | null>;
  downloadCapByIDWithCache: (id: string) => Promise<Cap>;
}

const initialActiveSection: CapStoreSection = {
  id: 'home',
  label: 'Home',
  type: 'section' as const,
};

const initialState = {
  // UI State
  activeSection: initialActiveSection,
  selectedCap: null,
  isInitialized: false,

  // Remote cap management
  remoteCaps: [],
  isFetching: false,
  isLoadingMore: false,
  error: null,
  hasMoreData: true,
  currentPage: 1,
  lastSearchParams: {},

  // Home data
  homeData: {
    topRated: [],
    trending: [],
    latest: [],
  },

  // Installed/Favorites moved to InstalledCapsStore
  isLoadingHome: false,
  homeError: null,

  //downloaded caps management
  downloadedCaps: {},
};

export const useCapStore = create<CapStoreState>()((set, get) => {
  // Auto-initialize when store is created
  const initialize = async () => {
    const { isInitialized, fetchCaps } = get();
    if (isInitialized) return;

    // Initial data fetching
    await Promise.all([fetchCaps()]);

    set({ isInitialized: true });
  };

  // Call initialize immediately when store is created
  // TODO: disable initialize
  // setTimeout(() => initialize(), 0);

  return {
    ...initialState,

    // Initialize method (can still be called manually if needed)
    initialize,

    // Main fetch functions
    fetchCaps: async (
      params: UseRemoteCapParams = {},
      append = false,
    ): Promise<RemoteCap[]> => {
      const capKit = await capKitService.getCapKit();

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
        const registryAddress =
          (tagsArray[0] as `0x${string}`) || DEFAULT_IDENTITY_REGISTRY_ADDRESS;
        // 1) Compute agent IDs for page
        const agentIds = await getAgentsByPage(
          registryAddress,
          pageNum,
          sizeNum,
        );
        // 2) Batch fetch owners and agent JSONs
        const [owners, agents] = await Promise.all([
          getOwnerAddressesByAgentIds(registryAddress, agentIds),
          getAgent8004ByPage(registryAddress, pageNum, sizeNum),
        ]);

        // 3) Map to RemoteCaps using owner as authorDID and 8004 name as idName
        const newRemoteCaps: RemoteCap[] = agents.map((agent, i) =>
          agent8004ToRemoteCap(agent as any, {
            authorDID:
              owners[i] || '0x0000000000000000000000000000000000000000',
            idName:
              (agent as any)?.name || `agent_${pageNum * sizeNum + i + 1}`,
          }),
        );

        const totalItems = agents.length || 0;
        const { remoteCaps } = get();

        set({
          hasMoreData: totalItems === sizeNum,
          remoteCaps: append
            ? [...remoteCaps, ...newRemoteCaps]
            : newRemoteCaps,
          currentPage: pageNum,
          isFetching: false,
          isLoadingMore: false,
        });

        return newRemoteCaps;
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

    // Minimal home fetch (placeholder). You can enhance it to fetch different sorts.
    fetchHome: async () => {
      try {
        set({ isLoadingHome: true, homeError: null });
        // Reuse fetchCaps to get first page
        const caps = await get().fetchCaps({ page: 0, size: 12 });
        const topRated = caps.slice(0, 4);
        const trending = caps.slice(4, 8);
        const latest = caps.slice(8, 12);
        const homeData = { topRated, trending, latest } as HomeData;
        set({ homeData, isLoadingHome: false });
        return homeData;
      } catch (e: any) {
        set({
          isLoadingHome: false,
          homeError: e?.message || 'Failed to load home',
        });
        return null;
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

    downloadCapByIDWithCache: async (id: string): Promise<Cap> => {
      // Return from cache if present
      const cachedCap = get().downloadedCaps[id];
      if (cachedCap) return cachedCap;

      // Find the RemoteCap in current list
      const remote = get().remoteCaps.find((c) => c.id === id);
      if (!remote) throw new Error('Cap not found in current list');

      // Simple conversion RemoteCap -> Cap
      const cap: Cap = {
        id: remote.id,
        authorDID: remote.authorDID,
        idName: remote.idName,
        core: {
          prompt: { value: '' },
          model: {
            providerId: 'openrouter',
            modelId: 'unknown',
            supportedInputs: ['text'],
            contextLength: 4096,
          },
          mcpServers: {},
          artifact: remote.metadata.thumbnail
            ? { srcUrl: remote.metadata.thumbnail }
            : undefined,
        },
        metadata: {
          displayName: remote.metadata.displayName,
          description: remote.metadata.description,
          introduction: remote.metadata.introduction,
          tags: remote.metadata.tags,
          homepage: remote.metadata.homepage,
          repository: remote.metadata.repository,
          thumbnail: remote.metadata.thumbnail,
        },
      } as Cap;

      set({ downloadedCaps: { ...get().downloadedCaps, [id]: cap } });
      return cap;
    },
  };
});
