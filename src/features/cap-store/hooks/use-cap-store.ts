import { useCallback } from 'react';
import { useCapKit } from '@/shared/hooks';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { CapStateStore } from '../stores';
import { type CapStats } from '@nuwa-ai/cap-kit';

/**
 * Hook for managing the installed caps
 */
export const useCapStore = () => {
  const { installedCaps, addInstalledCap, updateInstalledCap } =
    CapStateStore();
  const { capKit, isLoading, error } = useCapKit();
  const { setCurrentCap } = useCurrentCap();

  const rateCap = async (capId: string, rating: number) => {
    if (!capKit) {
      throw new Error('CapKit not initialized');
    }

    const result = await capKit.rateCap(capId, rating);

    if (result?.code !== 200) {
      throw new Error(result.error || 'Failed to rate cap');
    }

    // After rating, we should probably refetch the cap stats to show the update
    const statsResult = await capKit.queryCapStats(capId);
    if (statsResult.data) {
      // Also update the installed cap if it exists
      if (installedCaps[capId]) {
        updateInstalledCap(capId, { stats: statsResult.data });
      }
    }

    return result.data;
  };

  const fetchFavoriteStatus = async (capId: string) => {
    if (!capKit) {
      throw new Error('CapKit not initialized');
    }

    const result = await capKit.favorite(capId, 'isFavorite');

    if (result?.code !== 200) {
      throw new Error(result.error || 'Failed to rate cap');
    }

    console.log(result.data);

    if (installedCaps[capId]) {
      updateInstalledCap(capId, { isFavorite: result.data });
    }

    return result.data;
  };

  const downloadCapByCID = async (capCid: string) => {
    if (!capKit) {
      throw new Error('CapKit not initialized');
    }

    const capData = await capKit.downloadByCID(capCid, 'utf8');

      return capData;
  }

  const downloadCapByID = async (capId: string) => {
    if (!capKit) {
      throw new Error('CapKit not initialized');
    }

    const capData = await capKit.downloadByID(capId, 'utf8');

    return capData;
  };

  const addCapToFavorite = async (capId: string, version: string, capCid: string, stats: CapStats) => {

    const result = await capKit?.favorite(capId, 'add');

    if (result?.code !== 200) {
      throw new Error('Failed to add cap to favorite');
    }

    const installedCap = installedCaps[capId];
    if (!installedCap) {
      if (!capCid) {
        throw new Error('Cap CID is required for downloading cap');
      }
      const capData = await downloadCapByCID(capCid);
      addInstalledCap({
        cid: capCid,
        capData,
        version,
        stats,
        isFavorite: true,
        lastUsedAt: null,
      });
    } else {
      updateInstalledCap(capId, {
        isFavorite: true,
        stats: {
          ...installedCap.stats,
          favorites: installedCap.stats.favorites + 1,
        }
      });
    }
  };

  const removeCapFromFavorite = async (capId: string) => {
    if (!capId) {
      throw new Error('Cap CID is required for downloading cap');
    }
    const result = await capKit?.favorite(capId, 'remove');

    if (result?.code !== 200) {
      throw new Error('Failed to remove cap from favorite');
    }

    const installedCap = installedCaps[capId];
    if (!installedCap) {
      throw new Error('Cap is not installed');
    }
    updateInstalledCap(capId, {
      isFavorite: false,
      stats: {
        ...installedCap.stats,
        favorites: installedCap.stats.favorites - 1,
      }
    });
  };

  const runCap = useCallback(async (capId: string, version: string, capCid: string, stats: CapStats) => {
    const installedCap = installedCaps[capId];

    if (!installedCap) {
      const capData = await downloadCapByID(capId);
      addInstalledCap({
        cid: capCid,
        capData,
        version,
        stats: {
          ...stats,
          downloads: stats.downloads + 1,
        },
        isFavorite: false,
        lastUsedAt: Date.now(),
      });
      setCurrentCap(capData);
    } else {
      updateInstalledCap(capId, {
        lastUsedAt: Date.now(),
      });
      setCurrentCap(installedCap.capData);
      return installedCap.capData;
    }
  }, [capKit, isLoading, installedCaps]);

  const getRecentCaps = () => {
    return Object.values(installedCaps)
      .filter((cap) => cap.lastUsedAt !== null)
      .sort((a, b) => {
        if (a.lastUsedAt && b.lastUsedAt) {
          return b.lastUsedAt - a.lastUsedAt;
        }
        return 0;
      })
  };

  const getFavoriteCaps = () => {
    capKit?.queryMyFavorite()
    return Object.values(installedCaps)
      .filter((cap) => cap.isFavorite)
      .sort((a, b) => {
        if (a.lastUsedAt && b.lastUsedAt) {
          return b.lastUsedAt - a.lastUsedAt;
        }
        return 0;
      })
  };

  const removeCapFromRecents = (capId: string) => {
    const installedCap = installedCaps[capId];
    if (!installedCap) {
      throw new Error('Cap is not installed');
    }
    updateInstalledCap(capId, {
      ...installedCap,
      lastUsedAt: null,
    });
  };

  const isCapFavorite = (capId: string) => {
    const installedCap = installedCaps[capId];
    return installedCap?.isFavorite;
  };

  return {
    installedCaps,
    runCap,
    getFavoriteCaps,
    addCapToFavorite,
    removeCapFromFavorite,
    getRecentCaps,
    removeCapFromRecents,
    isCapFavorite,
    isLoading,
    error,
    rateCap,
    fetchFavoriteStatus,
  };
};
