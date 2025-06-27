import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createOpenAI } from '@ai-sdk/openai';

import { createAuthorizedFetch } from './fetch';
import { ChatStateStore } from '../../stores/chat-store';

// Base URL of Nuwa LLM Gateway
const BASE_URL = 'https://test-llm.nuwa.dev/api/v1';

const openrouter = createOpenRouter({
  apiKey: 'NOT_USED',
  baseURL: BASE_URL,
  fetch: createAuthorizedFetch(),
});

const openai = createOpenAI({
  apiKey: 'NOT_USED',
  baseURL: BASE_URL,
  fetch: createAuthorizedFetch(),
});

// Function to create provider with current selected model
const createDynamicProvider = () => {
  const selectedModel = ChatStateStore.getState().selectedModel;
  
  return customProvider({
    languageModels: {
      'chat-model': openrouter(selectedModel.id),
      'chat-model-reasoning': wrapLanguageModel({
        model: openrouter('gpt-4o-mini'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openrouter('gpt-4o-mini'),
      'artifact-model': openrouter('gpt-4o-mini'),
    },
    imageModels: {
      'small-model': openai.image('gpt-4o-mini'),
    },
  });
};



// Export a provider that dynamically resolves models
export const myProvider = {
  languageModel: (modelName: string) => {
    const provider = createDynamicProvider();
    return provider.languageModel(modelName);
  },
  imageModel: (modelName: string) => {
    const provider = createDynamicProvider();
    return provider.imageModel(modelName);
  },
};
