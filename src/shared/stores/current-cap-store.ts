import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalCap } from '@/features/cap-studio/types';
import { RemoteMCPManager } from '@/shared/services/global-mcp-manager';
import { createLocalStoragePersistConfig } from '@/shared/storage';
import type { Cap } from '@/shared/types';

// TODO: remove current cap store and use url to identify the current cap
interface CurrentCapState {
  currentCap: Cap | LocalCap | null;
  isInitialized: boolean;
  isError: boolean;
  errorMessage: string | null;
  setCurrentCap: (cap: Cap | LocalCap | null) => void;
  getCurrentCap: () => Cap | null;

  //current cap artifact tools
  // Tools keyed by chat/session id
  currentCapArtifactTools: Record<string, any> | null;

  // Set/replace tools for a given session
  setCurrentCapArtifactTools: (tools: Record<string, any>) => void;

  // Get tools for a session; returns empty object if none
  getCurrentCapArtifactTools: () => Record<string, any> | null;

  // Clear tools for a session
  clearCurrentCapArtifactTools: () => void;
}

// Persist only the minimal state that should survive reloads.
// We persist `currentCap` and leave transient flags/tooling out.
const persistConfig = createLocalStoragePersistConfig<CurrentCapState>({
  name: 'current-cap-storage',
  partialize: (state) => ({
    currentCap: state.currentCap,
  }),
});

export const CurrentCapStore = create<CurrentCapState>()(
  persist(
    (set, get) => ({
      currentCap: null,
      isInitialized: true,
      isError: false,
      errorMessage: null,

      getCurrentCap: () => {
        const currentCap = get().currentCap;
        //if it's the local cap, return the capData
        if (currentCap && 'capData' in currentCap) {
          return currentCap.capData;
        }
        return currentCap;
      },

      setCurrentCap: (cap: Cap | LocalCap | null) => {
        set({
          currentCap: cap,
          isInitialized: false,
          isError: false,
          errorMessage: null,
        });

        if (!cap) {
          set({ isInitialized: true });
          return;
        }

        // Initialize MCP for the new cap or cleanup if cap has no MCP servers
        const remoteMCPManager = RemoteMCPManager.getInstance();
        const mcpServers =
          'capData' in cap
            ? cap.capData.core.mcpServers
            : cap.core.mcpServers || {};
        const hasRemoteMcps = Object.keys(mcpServers).length > 0;

        if (hasRemoteMcps) {
          remoteMCPManager
            .initializeForCap('capData' in cap ? cap.capData : cap)
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
                'capData' in cap ? cap.capData.idName : cap.idName,
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
      currentCapArtifactTools: null,

      setCurrentCapArtifactTools: (
        currentCapArtifactTools: Record<string, any>,
      ) => {
        set(() => {
          return { currentCapArtifactTools };
        });
      },

      getCurrentCapArtifactTools: () => {
        return get().currentCapArtifactTools;
      },

      clearCurrentCapArtifactTools: () => {
        set((state) => {
          return { currentCapArtifactTools: null };
        });
      },
    }),
    persistConfig,
  ),
);
