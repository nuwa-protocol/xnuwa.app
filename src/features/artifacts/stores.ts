import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createArtifactsPersistConfig } from '@/shared/storage/indexeddb-config';
import type { Artifact } from './types';

interface ArtifactsState {
  artifacts: Record<string, Artifact>;

  // Actions
  addArtifact: (artifact: Artifact) => void;
  updateArtifact: (id: string, updates: Partial<Artifact>) => void;
  removeArtifact: (id: string) => void;
  getArtifact: (id: string) => Artifact | undefined;
  getArtifactsBySource: (sourceId: string) => Artifact[];
  getAllArtifacts: () => Artifact[];
  clearArtifacts: () => void;
}

export const useArtifactsStore = create<ArtifactsState>()(
  persist(
    (set, get) => ({
      artifacts: {},

      addArtifact: (artifact) => {
        set((state) => ({
          artifacts: {
            ...state.artifacts,
            [artifact.id]: artifact,
          },
        }));
      },

      updateArtifact: (id, updates) => {
        set((state) => {
          const existingArtifact = state.artifacts[id];
          if (!existingArtifact) return state;

          return {
            artifacts: {
              ...state.artifacts,
              [id]: {
                ...existingArtifact,
                ...updates,
                updatedAt: Date.now(),
              },
            },
          };
        });
      },

      removeArtifact: (id) => {
        set((state) => {
          const { [id]: removed, ...rest } = state.artifacts;
          return { artifacts: rest };
        });
      },

      getArtifact: (id) => {
        return get().artifacts[id];
      },

      getArtifactsBySource: (sourceId) => {
        const artifacts = get().artifacts;
        return Object.values(artifacts).filter(
          (artifact) => artifact.source.id === sourceId
        );
      },

      getAllArtifacts: () => {
        return Object.values(get().artifacts);
      },

      clearArtifacts: () => {
        set({ artifacts: {} });
      },
    }),
    createArtifactsPersistConfig({
      name: 'artifacts-store',
      partialize: (state) => ({ artifacts: state.artifacts }),
    }),
  ),
);
