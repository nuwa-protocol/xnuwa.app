import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rehydrationTracker } from '@/shared/hooks/use-rehydration';
import { capKitService } from '@/shared/services/capkit-service';
import { createInstalledCapsPersistConfig } from '@/shared/storage/indexeddb-config';
import type { Cap } from '@/shared/types';
import {
  isPreinstalledCap,
  mergeWithPreinstalledCaps,
} from '@/shared/utils/preinstalled-caps';

interface InstalledCapsState {
  installedCaps: Cap[];
  isFetchingInstalledCaps: boolean;
  installedCapsError: string | null;

  installCap: (capId: string) => Promise<Cap>;
  uninstallCap: (capId: string) => Promise<void>;

  fetchInstalledCaps: () => Promise<Cap[]>;
}

const persistConfig = createInstalledCapsPersistConfig<InstalledCapsState>({
  name: 'installed-caps-storage',
  partialize: (state) => ({ installedCaps: state.installedCaps }),
});

export const InstalledCapsStore = create<InstalledCapsState>()(
  persist(
    (set, get) => ({
      installedCaps: mergeWithPreinstalledCaps([]),
      isFetchingInstalledCaps: false,
      installedCapsError: null,

      installCap: async (capId: string) => {
        const capKit = await capKitService.getCapKit();
        const cap = await capKit.downloadByID(capId);
        if (!cap) {
          throw new Error('Failed to install cap');
        }
        await capKit.favorite(capId, 'add');
        await set({
          installedCaps: mergeWithPreinstalledCaps([
            ...get().installedCaps,
            cap,
          ]),
        });
        return cap;
      },

      uninstallCap: async (capId: string) => {
        if (isPreinstalledCap(capId)) {
          console.warn(
            `[installed-caps] Ignoring uninstall for pre-installed cap: ${capId}`,
          );
          return;
        }

        const capKit = await capKitService.getCapKit();
        await capKit.favorite(capId, 'remove');
        set({
          installedCaps: mergeWithPreinstalledCaps(
            get().installedCaps.filter((c) => c.id !== capId),
          ),
        });
      },

      fetchInstalledCaps: async () => {
        const capKit = await capKitService.getCapKit();
        if (!capKit) {
          const fallback = mergeWithPreinstalledCaps([]);
          set({
            installedCaps: fallback,
            isFetchingInstalledCaps: false,
          });
          return fallback;
        }

        set({ isFetchingInstalledCaps: true, installedCapsError: null });
        try {
          // Backend API still uses the "favorite" concept
          const response = await capKit.queryMyFavorite();
          const items = response.data?.items || [];
          const ids = items.map((item) => item.id).filter(Boolean);

          // Download full Cap objects in parallel; tolerate partial failures
          const results = await Promise.allSettled(
            ids.map((id: string) => capKit.downloadByID(id)),
          );
          const caps: Cap[] = results
            .filter(
              (r): r is PromiseFulfilledResult<Cap> => r.status === 'fulfilled',
            )
            .map((r) => r.value);

          const mergedCaps = mergeWithPreinstalledCaps(caps);
          set({ installedCaps: mergedCaps, isFetchingInstalledCaps: false });
          return mergedCaps;
        } catch (err) {
          console.error('Error fetching installed caps (favorites):', err);
          set({
            installedCapsError:
              'Failed to fetch installed caps. Please try again.',
            isFetchingInstalledCaps: false,
          });
          throw err;
        }
      },
    }),
    {
      ...persistConfig,
      // On rehydrate, refresh from server instead of relying on main.tsx
      onRehydrateStorage: () => {
        return async (_state, _error) => {
          try {
            // await InstalledCapsStore.getState().fetchInstalledCaps(); for debug purpose, disable the fetchInstalledCaps
          } catch {
            // swallow errors; UI can retry
          } finally {
            rehydrationTracker.markRehydrated('installed-caps-storage');
          }
        };
      },
    },
  ),
);
