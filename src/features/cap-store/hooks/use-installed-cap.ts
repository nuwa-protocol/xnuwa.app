import { useEffect, useState } from 'react';
import type { Cap } from '@/shared/types/cap';
import { CapStateStore } from '../stores';

/**
 * Hook for managing the installed caps
 */
export const useInstalledCap = (cap: Cap) => {
  const [state, setState] = useState(() => CapStateStore.getState());

  useEffect(() => {
    const unsubscribe = CapStateStore.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  const { installCap, uninstallCap, updateInstalledCap, installedCaps } = state;

  const isInstalled = !!installedCaps[cap.id];

  return {
    isInstalled,
    installCap,
    uninstallCap,
    updateInstalledCap,
  };
};
