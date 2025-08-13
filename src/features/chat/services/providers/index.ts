import { createOpenAI } from '@ai-sdk/openai';
import { createOpenRouter } from './openrouter-provider';
import { createPaymentFetch } from '@/shared/services/payment-fetch';

// Settings of Nuwa LLM Gateway
// const baseURL = 'https://test-llm.nuwa.dev/api/v1';
const baseURL = 'https://llm-gateway-payment-test.up.railway.app/api/v1';
const providerSettings = {
  apiKey: 'NOT-USED', // specify a fake api key to avoid provider errors
  baseURL,
  fetch: createPaymentFetch(baseURL),
};

const openrouter = createOpenRouter(providerSettings);
const openai = createOpenAI(providerSettings);

// Export a provider that dynamically resolves models
export const llmProvider = {
  chat: (modelId: string) => {
    return openrouter.chat(modelId);
  },
  utility: () => {
    return openrouter.chat('openai/gpt-4o-mini');
  },
  image: (modelId: string) => openai.image(modelId),
};
