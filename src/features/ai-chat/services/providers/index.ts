import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { IdentityKitWeb } from '@nuwa-ai/identity-kit-web';
import { DIDAuth } from '@nuwa-ai/identity-kit';

// Base URL of Nuwa LLM Gateway
const BASE_URL = 'https://test-llm.nuwa.dev/api/v1';

/**
 * Return a fetch implementation that automatically adds DIDAuth header.
 */
const createAuthorizedFetch = () => {
  return async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    // We only sign client-side requests; if running on server, fall back.
    if (typeof window === 'undefined') {
      throw new Error('createAuthorizedFetch is only available on client side');
    }

    try {
      const sdk = await IdentityKitWeb.init({ storage: 'local' });

      // Build signing payload – follow GatewayDebug.ts convention
      const url = new URL(input.toString());
      const payload = {
        operation: 'llm-gateway-request',
        params: {
          method: (init?.method ?? 'POST').toUpperCase(),
          path: url.pathname,
        },
      } as const;

      const sigObj = await sdk.sign(payload);
      const authHeader = DIDAuth.v1.toAuthorizationHeader(sigObj);

      const mergedHeaders = new Headers(init?.headers ?? {});
      mergedHeaders.set('Authorization', authHeader);

      return fetch(input, { ...init, headers: mergedHeaders });
    } catch (err) {
      console.error('Failed to sign DIDAuth header', err);
      throw err;
    }
  };
};

const openai = createOpenAI({
  apiKey: 'NOT_USED',
  baseURL: BASE_URL,
  fetch: createAuthorizedFetch(),
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai('gpt-4o-mini'),
    'chat-model-reasoning': wrapLanguageModel({
      model: openai('gpt-4o-mini'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': openai('gpt-4o-mini'),
    'artifact-model': openai('gpt-4o-mini'),
  },
  imageModels: {
    'small-model': openai.image('gpt-4o-mini'),
  },
});
