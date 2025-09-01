import { useCallback } from 'react';
import { useCapKit } from '@/shared/hooks';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { CapStateStore } from '../stores';
import { CapStats } from '@nuwa-ai/cap-kit';

/**
 * Hook for managing the installed caps
 */
export const useCapStore = () => {
  const { installedCaps, addInstalledCap, updateInstalledCap } =
    CapStateStore();
  const { capKit, isLoading, error } = useCapKit();
  const { setCurrentCap } = useCurrentCap();

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

  const addCapToFavorite = async (capId: string, capCid: string, stats: CapStats) => {

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
        stats,
        isFavorite: true,
        lastUsedAt: null,
      });
    } else {
      updateInstalledCap(capId, {
        isFavorite: true,
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
    });
  };

  const runCap = useCallback(
    async (capId: string) => {
      const installedCap = installedCaps[capId];

      if (!installedCap) {
        if (!capKit) {
          return null;
        }
        try {
          const query = await capKit.queryByID({id: capId});
          const capData = await capKit.downloadByID(capId, 'utf8');

          addInstalledCap({
            cid: query.data?.cid ?? '',
            capData,
            stats: query.data?.stats ?? {
              capId: capId,
              downloads: 0,
              ratingCount: 0,
              averageRating: 0,
              favorites: 0,
            },
            isFavorite: false,
            lastUsedAt: Date.now(),
          });
          setCurrentCap(capData);
          return capData;
        } catch (error) {
          throw new Error(`Failed to download cap: ${error}`);
        }
      } else {
        updateInstalledCap(capId, {
          lastUsedAt: Date.now(),
        });

        setCurrentCap(installedCap.capData);
        return installedCap.capData;
      }
    },
    [capKit, isLoading, installedCaps],
  );

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
  };
};
