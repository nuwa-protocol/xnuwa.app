import { create } from 'zustand';
import { GlobalMCPManager } from '@/shared/services/global-mcp-manager';
import type { Cap } from '@/shared/types';

export interface CurrentCap extends Cap {
  id: string;
  name: string;
}

interface CurrentCapState {
  currentCap: CurrentCap;
  setCurrentCap: (cap: CurrentCap) => void;
  clearCurrentCap: () => void;
}

const defaultCurrentCap: CurrentCap = {
  id: '1',
  name: 'ChatGPT-4o',
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
};

export const CurrentCapStore = create<CurrentCapState>()((set) => ({
  currentCap: defaultCurrentCap,

  setCurrentCap: (cap: CurrentCap) => {
    set({ currentCap: cap });

    // Initialize MCP for the new cap or cleanup if cap is null
    const mcpManager = GlobalMCPManager.getInstance();
    if (cap) {
      mcpManager.initializeForCap(cap).catch((error) => {
        console.error('Failed to initialize MCP for cap:', cap.id, error);
      });
    } else {
      mcpManager.cleanup().catch((error) => {
        console.error('Failed to cleanup MCP:', error);
      });
    }
  },

  clearCurrentCap: () => {
    set({ currentCap: defaultCurrentCap });

    // Cleanup MCP when clearing current cap
    const mcpManager = GlobalMCPManager.getInstance();
    mcpManager.cleanup().catch((error) => {
      console.error('Failed to cleanup MCP:', error);
    });
  },
}));
