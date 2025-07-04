// model-store.ts
// Store for managing model selection and favorites

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { NuwaIdentityKit } from '@/features/auth/services';
import { createPersistConfig, db } from '@/storage';
import { getAvailableModels } from '../services/models';
import type { Model } from '../types';

// default selected model
export const DEFAULT_SELECTED_MODEL: Model = {
  id: 'gpt-4o-mini',
  name: 'GPT-4o-mini',
  slug: 'gpt-4o-mini',
  providerName: 'OpenAI',
  providerSlug: 'openai',
  description:
    "GPT-4o-mini is OpenAI's newest model after GPT-4 Omni, supporting both text and image inputs with text outputs.",
  context_length: 128000,
  pricing: {
    input_per_million_tokens: 0.15,
    output_per_million_tokens: 0.6,
    request_per_k_requests: 0,
    image_per_k_images: 0.217,
    web_search_per_k_searches: 0,
  },
  supported_inputs: ['text', 'image', 'file'],
  supported_parameters: [
    'max_tokens',
    'temperature',
    'top_p',
    'stop',
    'frequency_penalty',
    'presence_penalty',
    'web_search_options',
    'seed',
    'logit_bias',
    'logprobs',
    'top_logprobs',
    'response_format',
    'structured_outputs',
    'tools',
    'tool_choice',
  ],
};

// get current DID
const getCurrentDID = async () => {
  const { getDid } = await NuwaIdentityKit();
  return await getDid();
};

const modelDB = db;

// model store state interface
interface ModelStateStoreState {
  // model selection state
  selectedModel: Model;
  setSelectedModel: (model: Model) => void;

  // favorites state
  favoriteModels: Model[];
  addToFavorites: (model: Model) => void;
  removeFromFavorites: (modelId: string) => void;

  // available models state
  availableModels: Model[] | null;
  isLoadingModels: boolean;
  modelsError: Error | null;
  fetchAvailableModels: () => Promise<void>;
  preloadModels: () => Promise<void>;
  reloadModels: () => Promise<void>;

  // data persistence
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
}

// persist configuration
const persistConfig = createPersistConfig<ModelStateStoreState>({
  name: 'model-storage',
  getCurrentDID: getCurrentDID,
  partialize: (state) => ({
    selectedModel: state.selectedModel,
    favoriteModels: state.favoriteModels,
  }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.loadFromDB();
      // preload models on store rehydration
      state.preloadModels();
    }
  },
});

// model store factory
export const ModelStateStore = create<ModelStateStoreState>()(
  persist(
    (set, get) => ({
      selectedModel: DEFAULT_SELECTED_MODEL,
      favoriteModels: [],

      // available models state
      availableModels: null,
      isLoadingModels: false,
      modelsError: null,

      setSelectedModel: (model: Model) => {
        set({ selectedModel: model });
        get().saveToDB();
      },

      addToFavorites: (model: Model) => {
        set((state) => {
          // avoid duplicates
          const isAlreadyFavorite = state.favoriteModels.some(
            (fav) => fav.id === model.id,
          );
          if (isAlreadyFavorite) return state;

          return {
            favoriteModels: [...state.favoriteModels, model],
          };
        });
        get().saveToDB();
      },

      removeFromFavorites: (modelId: string) => {
        set((state) => ({
          favoriteModels: state.favoriteModels.filter(
            (model) => model.id !== modelId,
          ),
        }));
        get().saveToDB();
      },

      // fetch available models
      fetchAvailableModels: async () => {
        const { availableModels, isLoadingModels } = get();

        // if there is cached data and not loading, return
        if (availableModels && !isLoadingModels) {
          return;
        }

        // if loading, wait for completion
        if (isLoadingModels) {
          return;
        }

        set({ isLoadingModels: true, modelsError: null });

        try {
          const models = await getAvailableModels();
          set({
            availableModels: models,
            isLoadingModels: false,
            modelsError: null,
          });
        } catch (error) {
          set({
            modelsError: error as Error,
            isLoadingModels: false,
          });
        }
      },

      // preload models (silent loading, no UI state)
      preloadModels: async () => {
        const { availableModels } = get();

        // if there is cached data, return
        if (availableModels) {
          return;
        }

        try {
          const models = await getAvailableModels();
          set({
            availableModels: models,
            modelsError: null,
          });
          console.log('Models preloaded successfully');
        } catch (error) {
          console.warn('Failed to preload models:', error);
          set({ modelsError: error as Error });
        }
      },

      // reload models (force refresh)
      reloadModels: async () => {
        set({ isLoadingModels: true, modelsError: null });

        try {
          const models = await getAvailableModels();
          set({
            availableModels: models,
            isLoadingModels: false,
            modelsError: null,
          });
        } catch (error) {
          set({
            modelsError: error as Error,
            isLoadingModels: false,
          });
        }
      },

      loadFromDB: async () => {
        if (typeof window === 'undefined') return;
        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;
          const record = await modelDB.models
            .where('did')
            .equals(currentDID)
            .first();
          if (record) {
            set({
              selectedModel: record.selectedModel,
              favoriteModels: record.favoriteModels,
            });
          }
        } catch (error) {
          console.error('Failed to load model store from DB:', error);
        }
      },

      saveToDB: async () => {
        if (typeof window === 'undefined') return;
        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;
          const { selectedModel, favoriteModels } = get();
          await modelDB.models.put({
            did: currentDID,
            selectedModel,
            favoriteModels,
          });
        } catch (error) {
          console.error('Failed to save model store to DB:', error);
        }
      },
    }),
    persistConfig,
  ),
);
