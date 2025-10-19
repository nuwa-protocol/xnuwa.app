import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocalCap } from '@/features/cap-studio/types';
import { RemoteMCPManager } from '@/shared/services/global-mcp-manager';
import { createLocalStoragePersistConfig } from '@/shared/storage';
import type { Cap } from '@/shared/types';

export interface CurrentCapState {
  currentCap: Cap | LocalCap | null;
  isInitialized: boolean;
  isError: boolean;
  errorMessage: string | null;
  setCurrentCap: (cap: Cap | LocalCap | null) => void;
  getCurrentCap: () => Cap | null;
  retryCurrentCapInit: () => void;

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
let initializeCapForStore: ((cap: Cap | LocalCap | null) => void) | null = null;

const basePersistConfig = createLocalStoragePersistConfig<CurrentCapState>({
  name: 'current-cap-storage',
  partialize: (state) => ({
    currentCap: state.currentCap,
  }),
});

const persistConfig = {
  ...basePersistConfig,
  onRehydrateStorage: () => {
    const baseHandler = basePersistConfig.onRehydrateStorage?.();

    return (state: CurrentCapState | undefined, error: unknown) => {
      baseHandler?.(state, error);

      if (!error) {
        initializeCapForStore?.(state?.currentCap ?? null);
      }
    };
  },
};

export const CurrentCapStore = create<CurrentCapState>()(
  persist((set, get) => {
    const initializeCap = (cap: Cap | LocalCap | null) => {
      set({
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

            if ((error as any).code === 'OAUTH_FLOW_INITIATED') {
              set({
                isError: true,
                errorMessage:
                  'MCP Server requires authentication. Please complete the OAuth flow and try again.',
              });
            } else {
              set({
                isError: true,
                errorMessage: errorMessage,
              });
              console.error(
                'Failed to initialize MCP for cap:@',
                'capData' in cap ? cap.capData.idName : cap.idName,
                error,
              );
            }
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
    };

    initializeCapForStore = initializeCap;

    return {
      currentCap: null,
      isInitialized: true,
      isError: false,
      isOAuthing: false,
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
        set({ currentCap: cap });
        initializeCap(cap);
      },

      retryCurrentCapInit: () => {
        const currentCap = get().currentCap;
        if (!currentCap) {
          return;
        }
        initializeCap(currentCap as Cap | LocalCap);
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
        set(() => {
          return { currentCapArtifactTools: null };
        });
      },
    };
  }, persistConfig),
);
