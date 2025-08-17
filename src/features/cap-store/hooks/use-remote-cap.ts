import { useState } from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import { CapStateStore } from '../stores';
import type { RemoteCap } from '../types';

interface UseRemoteCapParams {
  searchQuery?: string;
  tags?: string[];
  page?: number;
  size?: number;
}
/**
 * Hook for accessing the remote caps with advanced filtering, sorting, and pagination
 */
export function useRemoteCap() {
  const { capKit } = useCapKit();
  const { remoteCaps, setRemoteCaps } = CapStateStore();
  const [lastSearchParams, setLastSearchParams] = useState<UseRemoteCapParams>(
    {},
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchCaps = async (params: UseRemoteCapParams = {}, append = false) => {
    const {
      searchQuery: queryString = '',
      page: pageNum = 0,
      size: sizeNum = 50,
      tags: tagsArray = [],
    } = params;

    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setCurrentPage(0);
      setHasMoreData(true);
    }
    setError(null);
    setLastSearchParams(params);

    try {
      if (!capKit) {
        throw new Error('CapKit not initialized');
      }

      const response = await capKit.queryWithName(
        queryString,
        tagsArray,
        pageNum,
        sizeNum,
      );

      const newRemoteCaps: RemoteCap[] =
        response.data?.items
          ?.filter((item) => {
            return item.displayName !== 'nuwa_test';
          })
          .map((item) => {
            return {
              cid: item.cid,
              version: item.version,
              id: item.id,
              idName: item.name,
              authorDID: item.id.split(':')[0],
              metadata: {
                displayName: item.displayName,
                description: item.description,
                tags: item.tags,
                repository: item.repository,
                homepage: item.homepage,
                submittedAt: item.submittedAt,
                thumbnail: item.thumbnail,
              },
            };
          }) || [];

      // Check if we have more data
      const totalItems = response.data?.items?.length || 0;
      setHasMoreData(totalItems === sizeNum);

      if (append) {
        setRemoteCaps([...remoteCaps, ...newRemoteCaps]);
        setCurrentPage(pageNum);
      } else {
        setRemoteCaps(newRemoteCaps);
        setCurrentPage(pageNum);
      }

      setIsLoading(false);
      setIsLoadingMore(false);

      return response;
    } catch (err) {
      console.error('Error fetching caps:', err);
      setError('Failed to fetch caps. Please try again.');
      setIsLoading(false);
      setIsLoadingMore(false);
      throw err;
    }
  };

  const refetch = () => {
    fetchCaps(lastSearchParams);
  };

  const loadMore = async () => {
    if (!hasMoreData || isLoadingMore) return;

    const nextPage = currentPage + 1;
    return fetchCaps(
      {
        ...lastSearchParams,
        page: nextPage,
      },
      true,
    );
  };

  const goToPage = (newPage: number) => {
    return fetchCaps({
      searchQuery: '',
      page: newPage,
    });
  };

  return {
    remoteCaps,
    isLoading,
    isLoadingMore,
    hasMoreData,
    error,
    fetchCaps,
    loadMore,
    goToPage,
    refetch,
  };
}
