import { useEffect, useState } from 'react';
import { type CapFetchParams, fetchRemoteCaps } from '../services/cap-fetch';
import type { RemoteCap } from '../types';

interface UseRemoteCapState {
  remoteCaps: RemoteCap[];
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

  const fetchCaps = async (params: UseRemoteCapParams = {}) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const filters: CapFetchParams = {
        query: params.searchQuery || searchQuery,
        category: params.category || category,
        author: params.author || author,
        timeRange: params.timeRange || timeRange,
        sortBy: params.sortBy || sortBy,
        sortOrder: params.sortOrder || sortOrder,
        limit: params.limit || limit,
        offset: ((params.page || page) - 1) * (params.limit || limit),
      };

      const response = await fetchRemoteCaps(filters);

      setState((prev) => ({
        ...prev,
        remoteCaps: response.caps,
        isLoading: false,
        totalCount: response.total,
        hasMore: response.hasMore,
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
    if (initialLoad) {
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
