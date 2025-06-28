// model-store.ts
// Store for managing model selection and favorites

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { NuwaIdentityKit } from "@/features/auth/services";
import { createPersistConfig } from "@/storage";
import type { OpenRouterModel } from "../types";
import { db } from "@/storage";

// default selected model
export const DEFAULT_SELECTED_MODEL: OpenRouterModel = {
  "id": "openai/gpt-4o-mini",
  "canonical_slug": "openai/gpt-4o-mini",
  "hugging_face_id": null,
  "name": "OpenAI: GPT-4o-mini",
  "created": 1721260800,
  "description": "GPT-4o mini is OpenAI's newest model after [GPT-4 Omni](/models/openai/gpt-4o), supporting both text and image inputs with text outputs.\n\nAs their most advanced small model, it is many multiples more affordable than other recent frontier models, and more than 60% cheaper than [GPT-3.5 Turbo](/models/openai/gpt-3.5-turbo). It maintains SOTA intelligence, while being significantly more cost-effective.\n\nGPT-4o mini achieves an 82% score on MMLU and presently ranks higher than GPT-4 on chat preferences [common leaderboards](https://arena.lmsys.org/).\n\nCheck out the [launch announcement](https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/) to learn more.\n\n#multimodal",
  "context_length": 128000,
  "architecture": {
    "modality": "text+image->text",
    "input_modalities": [
      "text",
      "image",
      "file"
    ],
    "output_modalities": [
      "text"
    ],
    "tokenizer": "GPT",
    "instruct_type": null
  },
  "pricing": {
    "prompt": "0.00000015",
    "completion": "0.0000006",
    "request": "0",
    "image": "0.000217",
    "web_search": "0",
    "internal_reasoning": "0",
    "input_cache_read": "0.000000075"
  },
  "top_provider": {
    "context_length": 128000,
    "max_completion_tokens": 16384,
    "is_moderated": true
  },
  "per_request_limits": null,
  "supported_parameters": [
    "max_tokens",
    "temperature",
    "top_p",
    "stop",
    "frequency_penalty",
    "presence_penalty",
    "web_search_options",
    "seed",
    "logit_bias",
    "logprobs",
    "top_logprobs",
    "response_format",
    "structured_outputs",
    "tools",
    "tool_choice"
  ]
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
  selectedModel: OpenRouterModel;
  setSelectedModel: (model: OpenRouterModel) => void;

  // favorites state
  favoriteModels: OpenRouterModel[];
  addToFavorites: (model: OpenRouterModel) => void;
  removeFromFavorites: (modelId: string) => void;

  // data persistence
  loadFromDB: () => Promise<void>;
  saveToDB: () => Promise<void>;
}

// persist configuration
const persistConfig = createPersistConfig<ModelStateStoreState>({
  name: "model-storage",
  getCurrentDID: getCurrentDID,
  partialize: (state) => ({
    selectedModel: state.selectedModel,
    favoriteModels: state.favoriteModels,
  }),
  onRehydrateStorage: () => (state) => {
    if (state) {
      state.loadFromDB();
    }
  },
});

// model store factory
export const ModelStateStore = create<ModelStateStoreState>()(
  persist(
    (set, get) => ({
      selectedModel: DEFAULT_SELECTED_MODEL,
      favoriteModels: [],

      setSelectedModel: (model: OpenRouterModel) => {
        set({ selectedModel: model });
        get().saveToDB();
      },

      addToFavorites: (model: OpenRouterModel) => {
        set((state) => {
          // avoid duplicates
          const isAlreadyFavorite = state.favoriteModels.some(
            (fav) => fav.id === model.id
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
            (model) => model.id !== modelId
          ),
        }));
        get().saveToDB();
      },

      loadFromDB: async () => {
        if (typeof window === "undefined") return;
        try {
          const currentDID = await getCurrentDID();
          if (!currentDID) return;
          const record = await modelDB.models.where("did").equals(currentDID).first();
          if (record) {
            set({
              selectedModel: record.selectedModel,
              favoriteModels: record.favoriteModels,
            });
          }
        } catch (error) {
          console.error("Failed to load model store from DB:", error);
        }
      },

      saveToDB: async () => {
        if (typeof window === "undefined") return;
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
          console.error("Failed to save model store to DB:", error);
        }
      },

    }),
    persistConfig
  )
);