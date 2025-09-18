import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { LLM_GATEWAY_BASE_URL } from '@/shared/config/llm-gateway';
import { createPaymentFetch } from '@/shared/services/payment-fetch';
import type { CapModel } from '@/shared/types';

const paymentFetch = createPaymentFetch();

// Export a provider that dynamically resolves models
export const llmProvider = {
  chat: (model: CapModel) => {
    const providerSettings = {
      apiKey: 'NOT-USED', // specify a fake api key to avoid provider errors
      baseURL: model.customGatewayUrl || LLM_GATEWAY_BASE_URL,
      fetch: paymentFetch,
      extraBody: model.parameters,
    };

    const provider = createOpenRouter(providerSettings);
    return provider.chat(model.modelId);
  },
  utility: () => {
    const providerSettings = {
      apiKey: 'NOT-USED', // specify a fake api key to avoid provider errors
      baseURL: LLM_GATEWAY_BASE_URL,
      fetch: paymentFetch,
    };

    const provider = createOpenRouter(providerSettings);
    return provider.chat('openai/gpt-4o-mini');
  },
};
