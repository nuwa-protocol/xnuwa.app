import { create } from 'zustand';
import { GlobalMCPManager } from '@/shared/services/global-mcp-manager';
import type { Cap } from '@/shared/types';

interface CurrentCapState {
  currentCap: Cap;
  isCurrentCapMCPInitialized: boolean;
  isCurrentCapMCPError: boolean;
  errorMessage: string | null;
  setCurrentCap: (cap: Cap) => void;
}

const defaultCurrentCap: Cap = {
  idName: 'default-cap',
  core: {
    prompt: {
      value: 'You are a helpful AI assistant',
      suggestions: [],
    },
    model: {
      id: 'openai/chatgpt-4o-latest',
      name: ' ChatGPT-4o',
      slug: 'chatgpt-4o-latest',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      description:
        'OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of [GPT-4o](/models/openai/gpt-4o) in that it has additional RLHF. It is intended for research and evaluation.\n\nOpenAI notes that this model is not suited for production use-cases as it may be removed or redirected to another model in the future.',
      context_length: 128000,
      pricing: {
        input_per_million_tokens: 5,
        output_per_million_tokens: 15,
        request_per_k_requests: 0,
        image_per_k_images: 7.225,
        web_search_per_k_searches: 0,
      },
      supported_inputs: ['text', 'image'],
      supported_parameters: [
        'frequency_penalty',
        'logit_bias',
        'logprobs',
        'max_tokens',
        'presence_penalty',
        'response_format',
        'seed',
        'stop',
        'structured_outputs',
        'temperature',
        'top_logprobs',
        'top_p',
      ],
    },
    mcpServers: {},
  },
  metadata: {
    displayName: 'ChatGPT-4o',
    description:
      'OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of [GPT-4o](/models/openai/gpt-4o) in that it has additional RLHF. It is intended for research and evaluation.\n\nOpenAI notes that this model is not suited for production use-cases as it may be removed or redirected to another model in the future.',
    tags: ['ai', 'chatbot', 'openai'],
    author: '',
    submittedAt: 0,
  },
};

export const CurrentCapStore = create<CurrentCapState>()((set) => ({
  currentCap: defaultCurrentCap,
  isCurrentCapMCPInitialized: true,
  isCurrentCapMCPError: false,
  errorMessage: null,

  setCurrentCap: (cap: Cap) => {
    set({
      currentCap: cap,
      isCurrentCapMCPInitialized: false,
      isCurrentCapMCPError: false,
      errorMessage: null,
    });

    // Initialize MCP for the new cap or cleanup if cap has no MCP servers
    const mcpManager = GlobalMCPManager.getInstance();
    const mcpServers = cap.core.mcpServers || {};
    const hasMCPServers = Object.keys(mcpServers).length > 0;

    if (hasMCPServers) {
      mcpManager
        .initializeForCap(cap)
        .then(() => {
          console.log('Cap MCP Initialized Successfully');
        })
        .catch((error) => {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'MCP Server Initialization Failed, Please Check Configuration or Network Connection';

          set({
            isCurrentCapMCPError: true,
            errorMessage: errorMessage,
          });
          console.error(
            'Failed to initialize MCP for cap:@',
            cap.idName,
            error,
          );
        })
        .finally(() => {
          set({ isCurrentCapMCPInitialized: true });
        });
    } else {
      set({ isCurrentCapMCPInitialized: true });
      mcpManager
        .cleanup()
        .then(() => {
          console.log('Previous MCP servers cleaned up successfully');
        })
        .catch((error) => {
          console.warn('Failed to cleanup previous MCP servers:', error);
        });
    }
  },
}));
