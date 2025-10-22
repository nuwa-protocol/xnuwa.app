import { toast } from 'sonner';
import { CapStudioStore } from '@/features/cap-studio/stores';
import type { LocalCap } from '@/features/cap-studio/types';
import { parseYaml } from '@/features/cap-studio/utils/yaml';
import { type Cap, CapSchema } from '@/shared/types';
import { toLiveWebSocketUrl } from '@/shared/utils/live-source-url';
import { CurrentCapStore } from './current-cap-store';

export type LiveCapConnectionManager = {
  syncCaps: (caps: LocalCap[]) => void;
  refreshCap: (capId: string) => Promise<void>;
  removeCap: (capId: string) => void;
  clear: () => void;
};

type LiveConnection = {
  capId: string;
  sourceUrl: string;
  wsUrl: string;
  socket: WebSocket | null;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  manualDispose: boolean;
  isRefreshing: boolean;
};

const fetchAndUpdateLiveCap = async (
  capId: string,
): Promise<{ cap: LocalCap; validated: Cap }> => {
  const capStore = CapStudioStore.getState();
  const localCap = capStore.getCapById(capId);

  if (!localCap?.liveSource?.url) {
    throw new Error('Live cap HTTP source is not configured.');
  }

  const response = await fetch(localCap.liveSource.url, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to load YAML: ${response.statusText}`);
  }

  const text = await response.text();
  const data: any = parseYaml(text);

  if (Array.isArray(data)) {
    throw new Error('Live YAML must describe a single cap object.');
  }
  // TODO: wait for cap kit to upgrade
  const validated = CapSchema.parse({
    ...data,
    authorDID: 'did::unknown',
    id: `${localCap.capData.authorDID}:${data.idName}`,
  });

  const nextLiveSource = {
    ...localCap.liveSource,
    status: 'connected' as const,
    lastSyncedAt: Date.now(),
  };

  capStore.updateCap(capId, {
    capData: validated,
    liveSource: nextLiveSource,
  });

  const { currentCap, setCurrentCap } = CurrentCapStore.getState();

  if (currentCap && 'capData' in currentCap && currentCap.id === capId) {
    setCurrentCap({
      ...currentCap,
      capData: validated,
      liveSource: nextLiveSource,
      updatedAt: Date.now(),
    });
  }

  return { cap: localCap, validated };
};

export const createLiveCapConnectionManager = (): LiveCapConnectionManager => {
  const connections = new Map<string, LiveConnection>();

  const clearReconnectTimer = (connection: LiveConnection) => {
    if (connection.reconnectTimer) {
      clearTimeout(connection.reconnectTimer);
      connection.reconnectTimer = null;
    }
  };

  const disposeConnection = (connection: LiveConnection) => {
    clearReconnectTimer(connection);

    if (connection.socket) {
      try {
        connection.manualDispose = true;
        connection.socket.close();
      } catch (error) {
        console.error('Failed to close live cap websocket:', error);
      } finally {
        connection.socket = null;
      }
    }

    connections.delete(connection.capId);
  };

  const connect = (connection: LiveConnection) => {
    const latestCap = CapStudioStore.getState().getCapById(connection.capId);
    if (!latestCap?.liveSource?.url) {
      disposeConnection(connection);
      return;
    }

    if (connections.get(connection.capId) !== connection) {
      return;
    }

    try {
      const socket = new WebSocket(connection.wsUrl);
      connection.socket = socket;
      connection.manualDispose = false;

      socket.onmessage = (event) => {
        if (typeof event.data !== 'string') {
          return;
        }

        const payload = event.data.trim().toLowerCase();
        if (payload !== 'reload' && payload !== 'update') {
          return;
        }

        if (connection.isRefreshing) {
          return;
        }
        connection.isRefreshing = true;

        fetchAndUpdateLiveCap(connection.capId)
          .then(({ cap: localCap, validated }) => {
            const displayName =
              validated.metadata.displayName ??
              localCap.capData.metadata.displayName;

            toast.success(`[Cap Live Debug] "${displayName}" Updated`);
          })
          .catch((error) => {
            console.error('Live cap auto-refresh failed:', error);
            toast.error('Failed to refresh live cap update.');
          })
          .finally(() => {
            connection.isRefreshing = false;
          });
      };

      socket.onclose = () => {
        connection.socket = null;

        if (connection.manualDispose) {
          connection.manualDispose = false;
          return;
        }

        connection.reconnectTimer = setTimeout(() => {
          connect(connection);
        }, 1500);
      };

      socket.onerror = (event) => {
        console.error('Live cap websocket error:', event);
        CapStudioStore.getState().updateCap(connection.capId, {
          liveSource: undefined,
        });
        disposeConnection(connection);
      };

      console.debug(
        '[live-cap] connected',
        latestCap.capData.metadata.displayName,
      );
    } catch (error) {
      console.error('Failed to open live cap websocket:', error);
      connection.reconnectTimer = setTimeout(() => {
        if (connections.get(connection.capId) === connection) {
          connect(connection);
        }
      }, 1500);
    }
  };

  const startConnection = (cap: LocalCap) => {
    const sourceUrl = cap.liveSource?.url?.trim();
    if (!sourceUrl) {
      return;
    }

    const wsUrl = toLiveWebSocketUrl(sourceUrl);
    const existing = connections.get(cap.id);

    if (existing) {
      if (existing.wsUrl === wsUrl) {
        return;
      }

      disposeConnection(existing);
    }

    const connection: LiveConnection = {
      capId: cap.id,
      sourceUrl,
      wsUrl,
      socket: null,
      reconnectTimer: null,
      manualDispose: false,
      isRefreshing: false,
    };

    connections.set(cap.id, connection);
    connect(connection);
  };

  const disposeConnectionById = (capId: string) => {
    const existing = connections.get(capId);
    if (!existing) {
      return;
    }
    disposeConnection(existing);
  };

  const syncCaps = (caps: LocalCap[]) => {
    const nextIds = new Set<string>();

    caps.forEach((cap) => {
      const sourceUrl = cap.liveSource?.url?.trim();
      if (!sourceUrl) {
        disposeConnectionById(cap.id);
        return;
      }

      nextIds.add(cap.id);
      const existing = connections.get(cap.id);

      if (existing) {
        if (existing.sourceUrl !== sourceUrl) {
          disposeConnection(existing);
          startConnection(cap);
        }
        return;
      }

      startConnection(cap);
    });

    for (const [capId, connection] of Array.from(connections.entries())) {
      if (!nextIds.has(capId)) {
        disposeConnection(connection);
      }
    }
  };

  const refreshCap = async (capId: string) => {
    const connection = connections.get(capId);
    if (connection?.isRefreshing) {
      return;
    }

    if (connection) {
      connection.isRefreshing = true;
    }

    try {
      await fetchAndUpdateLiveCap(capId);
    } finally {
      if (connection) {
        connection.isRefreshing = false;
      }
    }
  };

  const clear = () => {
    for (const connection of Array.from(connections.values())) {
      disposeConnection(connection);
    }
    connections.clear();
  };

  return {
    syncCaps,
    refreshCap,
    removeCap: disposeConnectionById,
    clear,
  };
};
