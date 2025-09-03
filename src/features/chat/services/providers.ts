import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { LLM_GATEWAY_BASE_URL } from '@/shared/config/llm-gateway';
import { createPaymentFetch } from '@/shared/services/payment-fetch';

// Settings of Nuwa LLM Gateway
const baseURL = LLM_GATEWAY_BASE_URL;
const providerSettings = {
  apiKey: 'NOT-USED', // specify a fake api key to avoid provider errors
  baseURL,
  fetch: createPaymentFetch(baseURL),
};

const openai = createOpenRouter(providerSettings);

// Export a provider that dynamically resolves models
export const llmProvider = {
  chat: (modelId: string) => {
    return openai.chat(modelId);
  },
  utility: () => {
    return openai.chat('openai/gpt-4o-mini');
  },
};
