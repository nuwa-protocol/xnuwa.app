import { useCallback } from 'react';
import { useCapKit } from '@/shared/hooks';
import { useCurrentCap } from '@/shared/hooks/use-current-cap';
import { CapStateStore } from '../stores';

/**
 * Hook for managing the installed caps
 */
export const useCapStore = () => {
  const { installedCaps, addInstalledCap, updateInstalledCap } =
    CapStateStore();
  const { capKit, isLoading, error } = useCapKit();
  const { setCurrentCap } = useCurrentCap();

  const downloadCapWithCID = useCallback(
    async (capCid: string) => {
      if (!capKit) {
        throw new Error('CapKit not initialized');
      }

      const capData = await capKit.downloadCapWithCID(capCid, 'utf8');

      return capData;
    },
    [capKit],
  );

  const addCapToFavorite = async (capId: string, capCid?: string) => {
    const installedCap = installedCaps[capId];
    if (!installedCap) {
      if (!capCid) {
        throw new Error('Cap CID is required for downloading cap');
      }
      const capData = await downloadCapWithCID(capCid);
      addInstalledCap({
        cid: capCid,
        capData,
        isFavorite: true,
        lastUsedAt: null,
      });
    } else {
      updateInstalledCap(capId, {
        isFavorite: true,
      });
    }
  };

  const removeCapFromFavorite = (capId: string) => {
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
      console.log(installedCap);

      if (!installedCap) {
        if (!capKit) {
          return null;
        }
        try {
          const query = await capKit.queryCapWithID(capId);
          const capData = await capKit.downloadCapWithID(capId, 'utf8');

          addInstalledCap({
            cid: query.data?.cid ?? '',
            capData,
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
      .map((cap) => cap.capData);
  };

  const getFavoriteCaps = () => {
    return Object.values(installedCaps)
      .filter((cap) => cap.isFavorite)
      .sort((a, b) => {
        if (a.lastUsedAt && b.lastUsedAt) {
          return b.lastUsedAt - a.lastUsedAt;
        }
        return 0;
      })
      .map((cap) => cap.capData);
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
