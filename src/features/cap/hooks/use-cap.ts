'use client';

import { useCallback } from 'react';
import { CapStateStore, type InstalledCap } from '@/features/cap/stores';

// Individual cap management hook
export const useCap = (id: string) => {
  const store = CapStateStore();
  const cap = store.getInstalledCap(id);
  const isInstalled = store.isCapInstalled(id);
  const isEnabled = store.isCapEnabled(id);

  const installCap = useCallback(
    (capData: Omit<InstalledCap, 'installDate' | 'isEnabled' | 'did'>) => {
      store.installCap({ ...capData, id });
    },
    [id],
  );

  const uninstallCap = useCallback(() => {
    store.uninstallCap(id);
  }, [id]);

  const enableCap = useCallback(() => {
    store.enableCap(id);
  }, [id]);

  const disableCap = useCallback(() => {
    store.disableCap(id);
  }, [id]);

  const updateSettings = useCallback(
    (settings: Record<string, any>) => {
      store.updateCapSettings(id, settings);
    },
    [id],
  );

  const updateCap = useCallback(
    (updates: Partial<InstalledCap>) => {
      store.updateInstalledCap(id, updates);
    },
    [id],
  );

  return {
    cap,
    isInstalled,
    isEnabled,
    installCap,
    uninstallCap,
    enableCap,
    disableCap,
    updateSettings,
    updateCap,
  };
};
