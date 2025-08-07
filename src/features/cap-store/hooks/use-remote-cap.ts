import * as yaml from 'js-yaml';
import { useEffect, useState } from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import type { Cap } from '@/shared/types/cap';
import { parseCapContent, validateCapContent } from '../utils';

interface CapKitQueryResponse {
  code: number;
  data: {
    items: Array<{
      id: string;
      cid: string;
      name: string;
    }>;
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

interface UseRemoteCapState {
  remoteCaps: Cap[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  hasMore: boolean;
}

interface UseRemoteCapParams {
  searchQuery?: string;
  category?: string;
  author?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  sortBy?: 'downloads' | 'name' | 'updated' | 'created';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  page?: number;
  initialLoad?: boolean;
}

/**
 * Hook for accessing the remote caps with advanced filtering, sorting, and pagination
 */
export function useRemoteCap({
  searchQuery = '',
  category,
  author,
  timeRange = 'all',
  sortBy = 'downloads',
  sortOrder = 'desc',
  limit = 20,
  page = 1,
  initialLoad = true,
}: UseRemoteCapParams = {}) {
  const [state, setState] = useState<UseRemoteCapState>({
    remoteCaps: [],
    isLoading: false,
    error: null,
    totalCount: 0,
    page: page,
    hasMore: false,
  });

  const { capKit, isLoading: isCapKitLoading } = useCapKit();

  const fetchCaps = async (params: UseRemoteCapParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!capKit) {
        throw new Error('CapKit not initialized');
      }

      const response: CapKitQueryResponse = await capKit.queryWithName(
        params.searchQuery,
      );

      const remoteCapResults: (Cap | null)[] = await Promise.all(
        response.data.items.map(async (item) => {
          try {
            const capData = await capKit.downloadCap(item.cid, 'utf8');
            const downloadContent: unknown = yaml.load(capData.data.fileData);

            // check if the cap is valid
            if (!validateCapContent(downloadContent)) {
              console.warn(
                `Downloaded cap ${item.id} does not match Cap type specification, skipping...`,
              );
              return null;
            }

            // parse the cap content
            return parseCapContent(downloadContent);
          } catch (error) {
            console.error(`Error processing cap ${item.id}:`, error);
            return null;
          }
        }),
      );

      // filter out invalid caps
      const validRemoteCaps = remoteCapResults.filter(
        (cap): cap is Cap => cap !== null,
      );

      setState((prev) => ({
        ...prev,
        remoteCaps: validRemoteCaps,
        isLoading: false,
        totalCount: response.data.totalItems,
        hasMore: response.data.page < response.data.totalPages,
        page: params.page || page,
      }));

      return response;
    } catch (err) {
      console.error('Error fetching caps:', err);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch caps. Please try again.',
        isLoading: false,
      }));
      throw err;
    }
  };

  // Auto-fetch when search parameters change
  useEffect(() => {
    if (initialLoad && !isCapKitLoading) {
      fetchCaps();
    }
  }, [
    searchQuery,
    category,
    author,
    timeRange,
    sortBy,
    sortOrder,
    limit,
    page,
    initialLoad,
    isCapKitLoading,
  ]);

  const refetch = () => {
    return fetchCaps();
  };

  const goToPage = (newPage: number) => {
    return fetchCaps({ page: newPage });
  };

  const nextPage = () => {
    if (state.hasMore) {
      return fetchCaps({ page: state.page + 1 });
    }
    return Promise.resolve(null);
  };

  const previousPage = () => {
    if (state.page > 1) {
      return fetchCaps({ page: state.page - 1 });
    }
    return Promise.resolve(null);
  };

  const changeSort = (
    newSortBy: UseRemoteCapParams['sortBy'],
    newSortOrder?: UseRemoteCapParams['sortOrder'],
  ) => {
    return fetchCaps({
      sortBy: newSortBy,
      sortOrder:
        newSortOrder ||
        (newSortBy === sortBy
          ? sortOrder === 'asc'
            ? 'desc'
            : 'asc'
          : sortOrder),
      page: 1, // Reset to first page when sorting changes
    });
  };

  const changeFilters = (newFilters: Partial<UseRemoteCapParams>) => {
    return fetchCaps({
      ...newFilters,
      page: 1, // Reset to first page when filters change
    });
  };

  return {
    remoteCaps: state.remoteCaps,
    isLoading: state.isLoading,
    error: state.error,
    totalCount: state.totalCount,
    page: state.page,
    hasMore: state.hasMore,
    refetch,
    goToPage,
    nextPage,
    previousPage,
    changeSort,
    changeFilters,
  };
}
