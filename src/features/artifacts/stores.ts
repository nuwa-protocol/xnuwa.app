import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createArtifactsPersistConfig } from '@/shared/storage/indexeddb-config';
import type { ArtifactPayment, ArtifactSession } from './types';

interface ArtifactsState {
  artifactSessions: Record<string, ArtifactSession>;

  // Actions
  addArtifactSession: (artifactSession: ArtifactSession) => void;
  updateArtifactSession: (
    id: string,
    updates: Partial<ArtifactSession>,
  ) => void;
  removeArtifactSession: (id: string) => void;
  getArtifactSession: (id: string) => ArtifactSession | undefined;
  getAllArtifactSessions: () => ArtifactSession[];
  clearArtifactSessions: () => void;
  addPaymentCtxIdToArtifactSession: (
    id: string,
    payment: ArtifactPayment,
  ) => void;
}

export const ArtifactSessionsStore = create<ArtifactsState>()(
  persist(
    (set, get) => ({
      artifactSessions: {},

      addArtifactSession: (artifactSession) => {
        set((state) => ({
          artifactSessions: {
            ...state.artifactSessions,
            [artifactSession.id]: artifactSession,
          },
        }));
      },

      updateArtifactSession: (id, updates) => {
        set((state) => {
          const existingArtifact = state.artifactSessions[id];
          if (!existingArtifact) return state;

          return {
            artifactSessions: {
              ...state.artifactSessions,
              [id]: {
                ...existingArtifact,
                ...updates,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      removeArtifactSession: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.artifactSessions;
          return { artifactSessions: rest };
        });
      },

      getArtifactSession: (id) => {
        return get().artifactSessions[id];
      },

      getAllArtifactSessions: () => {
        return Object.values(get().artifactSessions);
      },

      addPaymentCtxIdToArtifactSession: (id, payment) => {
        set((state) => {
          const artifactSession = state.artifactSessions[id];
          if (!artifactSession) return state;
          return {
            artifactSessions: {
              ...state.artifactSessions,
              [id]: {
                ...artifactSession,
                payments: [...artifactSession.payments, payment],
              },
            },
          };
        });
      },

      clearArtifactSessions: () => {
        set({ artifactSessions: {} });
      },
    }),
    createArtifactsPersistConfig({
      name: 'artifacts-store',
      partialize: (state) => ({ artifactSessions: state.artifactSessions }),
    }),
  ),
);
