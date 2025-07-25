import { useEffect, useState } from 'react';
import { CapStateStore } from '../stores';
import type { RemoteCap } from '../types';

/**
 * Hook for managing the installed caps
 */
export const useInstalledCap = (remoteCap:RemoteCap) => {
  const [state, setState] = useState(() => CapStateStore.getState());

  useEffect(() => {
    const unsubscribe = CapStateStore.subscribe((newState) => {
      setState(newState);
    });
    
    return unsubscribe;
  }, []);

  const { installCap, uninstallCap, updateInstalledCap, installedCaps } = state;

  const isInstalled = !!installedCaps[remoteCap.id];
  const installedVersion = installedCaps[remoteCap.id]?.version;
  const hasUpdate = installedVersion !== remoteCap.version;

  return {
    isInstalled,
    installedVersion,
    installCap,
    uninstallCap,
    hasUpdate,
    updateInstalledCap,
  };
};
