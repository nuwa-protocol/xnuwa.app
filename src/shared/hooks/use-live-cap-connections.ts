import { useEffect, useMemo } from 'react';
import { CapStudioStore } from '@/features/cap-studio/stores';
import type { LocalCap } from '@/features/cap-studio/types';
import {
  createLiveCapConnectionManager,
  type LiveCapConnectionManager,
} from '@/shared/stores/live-cap-connection-manager';

const liveCapManager: LiveCapConnectionManager =
  createLiveCapConnectionManager();

const selectCapsWithLiveSource = (caps: LocalCap[]): LocalCap[] => {
  return caps.filter((cap) => cap.liveSource?.url?.trim());
};

let activeInstances = 0;
let isInitialized = false;
let unsubscribeCapStudio: (() => void) | null = null;

const ensureInitialized = () => {
  if (isInitialized) {
    return;
  }

  const sync = (caps: LocalCap[]) => {
    liveCapManager.syncCaps(selectCapsWithLiveSource(caps));
  };

  sync(CapStudioStore.getState().localCaps);
  unsubscribeCapStudio = CapStudioStore.subscribe((state) => {
    sync(state.localCaps);
  });
  isInitialized = true;
};

const cleanup = () => {
  unsubscribeCapStudio?.();
  unsubscribeCapStudio = null;
  isInitialized = false;
  liveCapManager.clear();
};

export const useLiveCapConnections = () => {
  useEffect(() => {
    activeInstances += 1;
    ensureInitialized();
    return () => {
      activeInstances = Math.max(activeInstances - 1, 0);
      if (activeInstances === 0) {
        cleanup();
      }
    };
  }, []);

  return useMemo(
    () => ({
      refreshCap: liveCapManager.refreshCap,
      removeCap: liveCapManager.removeCap,
    }),
    [],
  );
};
