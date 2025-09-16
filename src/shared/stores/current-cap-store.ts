import { create } from 'zustand';
import { defaultCap } from '@/shared/constants/cap';
import { RemoteMCPManager } from '@/shared/services/global-mcp-manager';
import type { Cap } from '@/shared/types';

interface CurrentCapState {
  currentCap: Cap;
  isInitialized: boolean;
  isError: boolean;
  errorMessage: string | null;
  setCurrentCap: (cap: Cap) => void;
}

export const CurrentCapStore = create<CurrentCapState>()((set) => ({
  currentCap: defaultCap,
  isInitialized: true,
  isError: false,
  errorMessage: null,

  setCurrentCap: (cap: Cap) => {
    set({
      currentCap: cap,
      isInitialized: false,
      isError: false,
      errorMessage: null,
    });

    // Initialize MCP for the new cap or cleanup if cap has no MCP servers
    const remoteMCPManager = RemoteMCPManager.getInstance();
    const mcpServers = cap.core.mcpServers || {};
    const hasRemoteMcps = Object.keys(mcpServers).length > 0;

    if (hasRemoteMcps) {
      remoteMCPManager
        .initializeForCap(cap)
        .catch((error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'MCP Server Initialization Failed, Please Check Configuration or Network Connection';

          set({
            isError: true,
            errorMessage: errorMessage,
          });
          console.error(
            'Failed to initialize MCP for cap:@',
            cap.idName,
            error,
          );
        })
        .finally(() => {
          set({ isInitialized: true });
        });
    } else {
      set({ isInitialized: true });
      remoteMCPManager.cleanup().catch((error) => {
        console.warn('Failed to cleanup previous MCP servers:', error);
      });
    }
  },
}));
