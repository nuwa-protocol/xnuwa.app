import { useCallback } from 'react';
import { SettingsStateStore } from '@/features/settings/stores';

// Sidebar state hook
export const useSidebarSettings = () => {
  const store = SettingsStateStore();

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    store.setSidebarCollapsed(collapsed);
  }, []);

  const setSidebarMode = useCallback((mode: 'pinned' | 'floating') => {
    store.setSidebarMode(mode);
  }, []);

  return {
    collapsed: store.sidebarCollapsed,
    mode: store.sidebarMode,
    setSidebarCollapsed,
    setSidebarMode,
  };
};
