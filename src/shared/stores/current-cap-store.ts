import { create } from 'zustand';
import type { Cap } from '@/shared/types';
import { GlobalMCPManager } from '@/shared/services/global-mcp-manager';

export interface CurrentCap extends Cap {
  id: string;
  name: string;
}

interface CurrentCapState {
  currentCap: CurrentCap | null;
  setCurrentCap: (cap: CurrentCap | null) => void;
  clearCurrentCap: () => void;
}

export const CurrentCapStore = create<CurrentCapState>()((set) => ({
  currentCap: null,

  setCurrentCap: (cap: CurrentCap | null) => {
    set({ currentCap: cap });
    
    // Initialize MCP for the new cap or cleanup if cap is null
    const mcpManager = GlobalMCPManager.getInstance();
    if (cap) {
      mcpManager.initializeForCap(cap).catch((error) => {
        console.error('Failed to initialize MCP for cap:', cap.id, error);
      });
    } else {
      mcpManager.cleanup().catch((error) => {
        console.error('Failed to cleanup MCP:', error);
      });
    }
  },

  clearCurrentCap: () => {
    set({ currentCap: null });
    
    // Cleanup MCP when clearing current cap
    const mcpManager = GlobalMCPManager.getInstance();
    mcpManager.cleanup().catch((error) => {
      console.error('Failed to cleanup MCP:', error);
    });
  },
}));
