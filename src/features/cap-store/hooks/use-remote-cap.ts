import { useCallback } from 'react';
import { useCapKit } from '@/shared/hooks/use-capkit';
import type { HomeData } from '../stores';
import {
  type UseRemoteCapParams,
  useInstalledCapStore,
  useRemoteCapStore,
} from '../stores';
import type { InstalledCap, RemoteCap } from '../types';
import { mapToRemoteCap } from '../utils';

/**
 * Hook for accessing the remote caps with advanced filtering, sorting, and pagination
 */
export function useRemoteCap() {
  const { capKit } = useCapKit();
  const { installedCaps, addInstalledCap } = useInstalledCapStore();
  const {
    remoteCaps,
    isFetching,
    isLoadingMore,
    error,
    hasMoreData,
    currentPage,
    lastSearchParams,
    setRemoteCaps,
    setIsFetching,
    setIsLoadingMore,
    setError,
    setHasMoreData,
    setCurrentPage,
    setLastSearchParams,

    homeData,
    isLoadingHome,
    homeError,
    setHomeData,
    setIsLoadingHome,
    setHomeError,
  } = useRemoteCapStore();

  const fetchCaps = useCallback(
    async (params: UseRemoteCapParams = {}, append = false) => {
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
        setIsLoadingMore(true);
      } else {
        setCurrentPage(0);
        setIsFetching(true);
        setHasMoreData(true);
      }
      setError(null);
      setLastSearchParams(params);

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

        setIsFetching(false);
        setIsLoadingMore(false);

        return response;
      } catch (err) {
        console.error('Error fetching caps:', err);
        setError('Please check your network connection and try again.');
        setIsFetching(false);
        setIsLoadingMore(false);
        throw err;
      }
    },
    [
      capKit,
      setRemoteCaps,
      setIsFetching,
      setIsLoadingMore,
      setError,
      setHasMoreData,
      setCurrentPage,
      setLastSearchParams,
    ],
  );

  const refetch = () => {
    fetchCaps(lastSearchParams);
  };

  const loadMore = () => {
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

  const downloadCap = useCallback(
    async (remoteCap: RemoteCap): Promise<InstalledCap | null> => {
      if (!capKit) {
        return null;
      }

      // check if cap is already installed
      const installedCap = installedCaps[remoteCap.id];
      if (installedCap) {
        return installedCap;
      }

      // download cap if not installed
      const downloadedCap = await capKit.downloadByCID(remoteCap.cid);
      const capToInstall = {
        cid: remoteCap.cid,
        capData: downloadedCap,
        stats: remoteCap.stats,
        version: remoteCap.version,
        isFavorite: false,
        lastUsedAt: null,
      };
      await addInstalledCap(capToInstall);
      return capToInstall;
    },
    [capKit, installedCaps, addInstalledCap],
  );

  const fetchHome = useCallback(async (): Promise<HomeData | null> => {
    if (!capKit) {
      return null;
    }

    setIsLoadingHome(true);
    setHomeError(null);

    try {
      // Fetch all cap categories in parallel
      const [topRatedResponse, trendingResponse, latestResponse] =
        await Promise.all([
          // Fetch top rated caps (6 caps with highest average rating)
          capKit.queryByName('', {
            sortBy: 'average_rating',
            sortOrder: 'desc',
            page: 0,
            size: 6,
          }),
          // Fetch trending caps (6 caps with most downloads)
          capKit.queryByName('', {
            sortBy: 'downloads',
            sortOrder: 'desc',
            page: 0,
            size: 6,
          }),
          // Fetch latest caps (6 caps with latest updated_at)
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

      setHomeData(homeData);
      setIsLoadingHome(false);
      return homeData;
    } catch (err) {
      console.error('Error fetching home data:', err);
      setHomeError('Failed to load home data. Please try again.');
      setIsLoadingHome(false);
      throw err;
    }
  }, [capKit, setHomeData, setIsLoadingHome, setHomeError]);

  return {
    remoteCaps,
    isFetching,
    isLoadingMore,
    hasMoreData,
    error,
    fetchCaps,
    loadMore,
    goToPage,
    refetch,
    downloadCap,
    homeData,
    isLoadingHome,
    homeError,
    fetchHome,
  };
}
