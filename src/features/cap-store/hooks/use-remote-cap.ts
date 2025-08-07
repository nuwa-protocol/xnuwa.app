import * as yaml from 'js-yaml';
import { useEffect, useState } from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import type { Cap } from '@/shared/types/cap';
import { CapStateStore } from '../stores';
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

interface UseRemoteCapParams {
  searchQuery?: string;
  page?: number;
}

/**
 * Hook for accessing the remote caps with advanced filtering, sorting, and pagination
 */
export function useRemoteCap() {
  const [storeState, setStoreState] = useState(() => CapStateStore.getState());

  // Subscribe to store changes
  useEffect(() => {
    const unsubscribe = CapStateStore.subscribe((newState) => {
      setStoreState(newState);
    });

    return unsubscribe;
  }, []);

  const { capKit, isLoading: isCapKitLoading } = useCapKit();

  const {
    setRemoteCaps,
    setRemoteCapLoading,
    setRemoteCapError,
    setRemoteCapPagination,
    setLastSearchQuery,
  } = storeState;

  const { remoteCapState } = storeState;

  const fetchCaps = async (params: UseRemoteCapParams = {}) => {
    const { searchQuery: queryString = '', page: pageNum = 1 } = params;

    setRemoteCapLoading(true);
    setRemoteCapError(null);

    try {
      if (!capKit) {
        throw new Error('CapKit not initialized');
      }

      const response: CapKitQueryResponse =
        await capKit.queryWithName(queryString);

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

      setRemoteCaps(validRemoteCaps);
      setRemoteCapPagination({
        totalCount: response.data.totalItems,
        page: pageNum,
        hasMore: response.data.page < response.data.totalPages,
      });
      setLastSearchQuery(queryString);
      setRemoteCapLoading(false);

      return response;
    } catch (err) {
      console.error('Error fetching caps:', err);
      setRemoteCapError('Failed to fetch caps. Please try again.');
      setRemoteCapLoading(false);
      throw err;
    }
  };

  useEffect(() => {
    if (capKit && !isCapKitLoading) {
      fetchCaps({ searchQuery: '', page: 1 });
    }
  }, [capKit, isCapKitLoading]);

  const refetch = (newSearchQuery?: string) => {
    const queryString =
      newSearchQuery !== undefined
        ? newSearchQuery
        : remoteCapState.lastSearchQuery;
    return fetchCaps({ searchQuery: queryString, page: 1 });
  };

  const goToPage = (newPage: number) => {
    return fetchCaps({
      searchQuery: remoteCapState.lastSearchQuery,
      page: newPage,
    });
  };

  const nextPage = () => {
    if (remoteCapState.hasMore) {
      return fetchCaps({
        searchQuery: remoteCapState.lastSearchQuery,
        page: remoteCapState.page + 1,
      });
    }
    return Promise.resolve(null);
  };

  const previousPage = () => {
    if (remoteCapState.page > 1) {
      return fetchCaps({
        searchQuery: remoteCapState.lastSearchQuery,
        page: remoteCapState.page - 1,
      });
    }
    return Promise.resolve(null);
  };

  return {
    remoteCaps: remoteCapState.remoteCaps,
    isLoading: remoteCapState.isLoading,
    error: remoteCapState.error,
    totalCount: remoteCapState.totalCount,
    page: remoteCapState.page,
    hasMore: remoteCapState.hasMore,
    lastSearchQuery: remoteCapState.lastSearchQuery,
    fetchCaps,
    refetch,
    goToPage,
    nextPage,
    previousPage,
  };
}
