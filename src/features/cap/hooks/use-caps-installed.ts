'use client';

import { useCallback } from 'react';
import { CapStateStore, type InstalledCap } from '@/stores/cap-store';

// Installed caps management hook
export const useInstalledCaps = () => {
  const store = CapStateStore();

  const installCap = useCallback(
    (cap: Omit<InstalledCap, 'installDate' | 'isEnabled' | 'did'>) => {
      store.installCap(cap);
    },
    [],
  );

  const uninstallCap = useCallback((id: string) => {
    store.uninstallCap(id);
  }, []);

  const updateInstalledCap = useCallback(
    (id: string, updates: Partial<InstalledCap>) => {
      store.updateInstalledCap(id, updates);
    },
    [],
  );

  const clearAllInstalledCaps = useCallback(() => {
    store.clearAllInstalledCaps();
  }, []);

  const getInstalledCapsByCategory = useCallback((category: string) => {
    return store.getInstalledCapsByCategory(category);
  }, []);

  return {
    installedCaps: store.getAllInstalledCaps(),
    capCount: store.getInstalledCapCount(),
    installCap,
    uninstallCap,
    updateInstalledCap,
    clearAllInstalledCaps,
    getInstalledCapsByCategory,
    isCapInstalled: store.isCapInstalled,
    getInstalledCap: store.getInstalledCap,
    isCapEnabled: store.isCapEnabled,
    enableCap: store.enableCap,
    disableCap: store.disableCap,
  };
};
