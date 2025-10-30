import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rehydrationTracker } from '@/shared/hooks/use-rehydration';
import { createInstalledCapsPersistConfig } from '@/shared/storage/indexeddb-config';
import type { Cap } from '@/shared/types';
import { preinstalledCaps } from '@/shared/utils/preinstalled-caps';
import { useCapStore } from '@/features/cap-store/stores';

interface InstalledCapsState {
  installedCaps: Cap[];

  // Local-only management of installed caps
  installCap: (capId: string) => Promise<Cap>;
  uninstallCap: (capId: string) => Promise<void>;
  updateCap: (capId: string) => Promise<Cap>;
}

const persistConfig = createInstalledCapsPersistConfig<InstalledCapsState>({
  name: 'installed-caps-storage',
  partialize: (state) => ({ installedCaps: state.installedCaps }),
});

export const InstalledCapsStore = create<InstalledCapsState>()(
  persist(
    (set, get) => ({
      installedCaps: preinstalledCaps,
      // Install a cap using the same local mapping approach as cap-store/stores.ts
      // No network or CapKit usage: we derive a Cap from the current store cache
      installCap: async (capId: string) => {
        // Build Cap from local cache (remote list and/or raw agent JSON)
        const cap = await useCapStore
          .getState()
          .downloadCapByIDWithCache(capId);
        // Prevent duplicates
        const exists = get().installedCaps.some((c) => c.id === cap.id);
        if (!exists) set({ installedCaps: [...get().installedCaps, cap] });
        return cap;
      },

      uninstallCap: async (capId: string) => {
        set({
          installedCaps: get().installedCaps.filter((c) => c.id !== capId),
        });
      },

      // Force refresh an installed cap from local sources (bypasses the download cache)
      updateCap: async (capId: string) => {
        // Drop from downloaded cache to rebuild from the latest mapped agent/remote data
        const capStoreState = useCapStore.getState();
        const currentDownloaded = capStoreState.downloadedCaps || {};
        if (capId in currentDownloaded) {
          const next = { ...currentDownloaded };
          delete (next as any)[capId];
          useCapStore.setState({ downloadedCaps: next });
        }

        const cap = await useCapStore
          .getState()
          .downloadCapByIDWithCache(capId);

        set({
          installedCaps: get().installedCaps.map((c) =>
            c.id === capId ? cap : c,
          ),
        });

        return cap;
      },
    }),
    {
      ...persistConfig,
      // On rehydrate, we only mark as rehydrated; installed caps are managed locally
      onRehydrateStorage: () => {
        return async (_state, _error) => {
          rehydrationTracker.markRehydrated('installed-caps-storage');
        };
      },
    },
  ),
);
