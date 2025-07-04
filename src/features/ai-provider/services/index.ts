import { createOpenAI } from '@ai-sdk/openai';
import { ModelStateStore } from '../stores';
import { createAuthorizedFetch } from './fetch';
import { createOpenRouter } from './openrouter-provider';

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
    const webSearchEnabled = ModelStateStore.getState().webSearchEnabled;
    return openrouter.chat(
      selectedModel.id,
      webSearchEnabled
        ? {
            extraBody: {
              plugins: [
                {
                  id: 'web',
                  max_results: 3,
                },
              ],
            },
          }
        : {},
    );
  },
  artifact: () => {
    const selectedModel = ModelStateStore.getState().selectedModel;
    return openrouter.chat(selectedModel.id);
  },
  utility: () => {
    const selectedModel = ModelStateStore.getState().selectedModel;
    return openrouter.chat('openai/gpt-4o-mini');
  },
  image: () => {
    return openai.image('dall-e-3');
  },
};
