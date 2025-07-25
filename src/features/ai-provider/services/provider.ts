import { createOpenAI } from '@ai-sdk/openai';
import { createAuthorizedFetch } from './fetch';
import { getModelSettings } from './models';
import { createOpenRouter } from './openrouter-provider';

// Settings of Nuwa LLM Gateway
const providerSettings = {
  apiKey: 'NOT-USED', // specify a fake api key to avoid provider errors
  baseURL: 'https://test-llm.nuwa.dev/api/v1',
  fetch: createAuthorizedFetch(),
};

const openrouter = createOpenRouter(providerSettings);
const openai = createOpenAI(providerSettings);

// Export a provider that dynamically resolves models
export const llmProvider = {
  chat: () => {
    const { modelId } = getModelSettings();
    return openrouter.chat(modelId);
  },
  utility: () => {
    return openrouter.chat('openai/gpt-4o-mini');
  },
  image: () => openai.image('dall-e-3'),
};
