import { create } from 'zustand';

interface SidebarState {
  // Sidebar state
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  
  mode: 'pinned' | 'floating';
  setMode: (mode: 'pinned' | 'floating') => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  // Sidebar state
  collapsed: false,
  setCollapsed: (collapsed: boolean) => {
    set({ collapsed });
  },
  
  mode: 'pinned',
  setMode: (mode: 'pinned' | 'floating') => {
    set({ mode });
  },
})); 