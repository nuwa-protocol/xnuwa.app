'use client';

import { useEffect, useState } from 'react';
import {
  type CapSearchFilters,
  getCapsByCategory,
  type RemoteCap,
  searchRemoteCaps,
} from '@/features/cap/services';

interface UseCapRemoteState {
  remoteCaps: RemoteCap[];
  isLoading: boolean;
  error: string | null;
}

interface UseCapRemoteParams {
  searchQuery?: string;
  category?: string;
  initialLoad?: boolean;
}

export function useCapRemote({
  searchQuery = '',
  category = 'all',
  initialLoad = true,
}: UseCapRemoteParams = {}) {
  const [state, setState] = useState<UseCapRemoteState>({
    remoteCaps: [],
    isLoading: false,
    error: null,
  });

  const fetchCaps = async (
    query: string = searchQuery,
    cat: string = category,
  ) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      let caps: RemoteCap[];

      if (query.trim()) {
        const response = await searchRemoteCaps({
          query,
          category: cat === 'all' ? undefined : cat,
        });
        caps = response.caps;
      } else {
        caps = await getCapsByCategory(cat);
      }

      setState((prev) => ({ ...prev, remoteCaps: caps, isLoading: false }));
    } catch (err) {
      console.error('Error fetching caps:', err);
      setState((prev) => ({
        ...prev,
        error: 'Failed to fetch caps. Please try again.',
        isLoading: false,
      }));
    }
  };

  // Auto-fetch when search query or category changes
  useEffect(() => {
    if (initialLoad) {
      fetchCaps(searchQuery, category);
    }
  }, [searchQuery, category, initialLoad]);

  const refetch = () => {
    fetchCaps();
  };

  const searchCaps = (filters: CapSearchFilters) => {
    return searchRemoteCaps(filters);
  };

  const getCategoryData = (cat: string, limit?: number) => {
    return getCapsByCategory(cat, limit);
  };

  return {
    ...state,
    refetch,
    searchCaps,
    getCategoryData,
  };
}
