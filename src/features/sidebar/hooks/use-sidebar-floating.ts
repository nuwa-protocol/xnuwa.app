import { useCallback } from 'react';
import { useSidebarStore } from '../stores';

export const useSidebarFloating = () => {
  const { collapsed, mode, setCollapsed, setMode } = useSidebarStore();

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setCollapsed(collapsed);
  }, [setCollapsed]);

  const setSidebarMode = useCallback((mode: 'pinned' | 'floating') => {
    setMode(mode);
  }, [setMode]);

  return {
    collapsed,
    mode,
    setSidebarCollapsed,
    setSidebarMode,
  };
};
