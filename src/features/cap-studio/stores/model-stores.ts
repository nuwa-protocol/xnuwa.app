import { create } from 'zustand';
import type { ModelDetails } from '../components/cap-edit/model/model-selector/type';
import { fetchModels } from '../services';

// model store state interface
interface ModelStateStoreState {
  // model selection state
  selectedModel: ModelDetails | null;
  setSelectedModel: (model: ModelDetails) => void;

  // available models state
  availableModels: ModelDetails[] | null;
  isLoadingModels: boolean;
  modelsError: Error | null;
  fetchAvailableModels: (gatewayUrl: string) => Promise<void>;
  reloadModels: (gatewayUrl: string) => Promise<void>;
}

// model store factory
export const ModelStateStore = create<ModelStateStoreState>()((set, get) => ({
  selectedModel: null,

  // available models state
  availableModels: null,
  isLoadingModels: false,
  modelsError: null,

  setSelectedModel: (model: ModelDetails | null) => {
    set({ selectedModel: model });
  },

  // fetch available models
  fetchAvailableModels: async (gatewayUrl: string) => {
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
      const models = await fetchModels(gatewayUrl);
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

  // reload models (force refresh)
  reloadModels: async (gatewayUrl: string) => {
    set({ isLoadingModels: true, modelsError: null });

    try {
      const models = await fetchModels(gatewayUrl);
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
}));
