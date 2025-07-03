import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { ModelStateStore } from '../../stores/model-store';
import { createAuthorizedFetch } from './fetch';

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

// Export a provider that dynamically resolves models
export const llmProvider = {
  chat: () => {
    const selectedModel = ModelStateStore.getState().selectedModel;
    return openrouter(selectedModel.id);
  },
  artifact: () => {
    const selectedModel = ModelStateStore.getState().selectedModel;
    return openrouter(selectedModel.id);
  },
  utility: () => {
    const selectedModel = ModelStateStore.getState().selectedModel;
    return openrouter('openai/gpt-4o-mini');
  },
  image: () => {
    return openai.image('dall-e-3');
  },
};
