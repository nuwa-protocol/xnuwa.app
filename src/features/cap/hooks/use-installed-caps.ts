import { CapStateStore } from '../stores';

/**
 * Hook for managing the installed caps
 */
export const useInstalledCaps = () => {
  const { installCap, uninstallCap, updateInstalledCap, installedCaps } =
    CapStateStore.getState();

  const isCapInstalled = (id: string) => {
    return !!installedCaps[id];
  };


  return {
    installedCaps,
    isCapInstalled,
    installCap,
    uninstallCap,
    updateInstalledCap,
  };
};
