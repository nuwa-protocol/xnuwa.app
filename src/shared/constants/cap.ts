import type { Cap, CapModel } from '../types';

export const predefinedTags = [
  'AI Model',
  'Coding',
  'Content Writing',
  'Research',
  'Crypto',
  'Tools',
  'Others',
];

export const promptVariables = [
  {
    name: '{{user_geo}}',
    description: "The user's location",
    example: 'Latitude: 33.354514786838998, Longitude: 100.10581180059799',
    value: `The user's location is {{user_geo}}`,
  },
  {
    name: '{{artifact_selections}}',
    description: 'The current selections from the artifact.',
    example:
      '1. Selection Message 1\n2. Selection Message 2\n3. Selection Message 3',
    value: `Below are the current user selections:\n {{artifact_selections}}`,
  },
];

export const defaultCap: Cap = {
  id: 'did::default:default_cap',
  authorDID: 'did::default',
  idName: 'default_cap',
  core: {
    prompt: {
      value: 'You are a helpful AI assistant',
      suggestions: [],
    },
    model: {
      modelId: 'gpt-4o',
      parameters: {
        temperature: 0.7,
      },
      supportedInputs: ['text', 'image'],
      providerId: 'openrouter',
      contextLength: 128000,
    },
    mcpServers: {},
  },
  metadata: {
    displayName: 'ChatGPT-4o',
    description:
      'OpenAI ChatGPT 4o is continually updated by OpenAI to point to the current version of GPT-4o used by ChatGPT. It therefore differs slightly from the API version of GPT-4o in that it has additional RLHF. It is intended for research and evaluation.',
    tags: ['ai', 'chatbot', 'openai'],
    thumbnail:
      'https://unpkg.com/@lobehub/icons-static-png@1.60.0/light/openai.png',
  },
};

export const SUPPORTED_PROVIDERS: Record<
  CapModel['providerId'],
  {
    name: string;
    description: string;
    icon: string;
    iconDark?: string;
  }
> = {
  openai_chat_completion: {
    name: 'OpenAI (Chat Completion API)',
    description: 'Select this provider for OpenAI Chat Completion API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/openai.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/openai.png',
  },
  openai_responses: {
    name: 'OpenAI (Responses API)',
    description: 'Select this provider for OpenAI Responses API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/openai.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/openai.png',
  },
  anthropic: {
    name: 'Anthropic',
    description: 'Select this provider for Anthropic Messages API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/anthropic.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/anthropic.png',
  },
  google: {
    name: 'Google',
    description: 'Select this provider for Google  Generative API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/google-color.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/google-color.png',
  },
  xai: {
    name: 'XAI',
    description: 'Select this provider for xAI API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/xai.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/xai.png',
  },
  groq: {
    name: 'Groq',
    description: 'Select this provider for Groq API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/groq.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/groq.png',
  },
  togetherai: {
    name: 'TogetherAI',
    description: 'Select this provider for TogetherAI API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/together-color.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/together-color.png',
  },
  azure: {
    name: 'Azure',
    description: 'Select this provider for Azure OpenAI chat API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/azureai-color.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/azureai-color.png',
  },
  deepseek: {
    name: 'DeepSeek',
    description:
      'Select this provider for DeepSeek API models, including the DeepSeek-V3 models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/deepseek-color.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/deepseek-color.png',
  },
  mistral: {
    name: 'Mistral',
    description: 'Select this provider for Mistral chat API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/mistral-color.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/mistral-color.png',
  },
  openrouter: {
    name: 'OpenRouter',
    description: 'Select this provider for OpenRouter API models.',
    icon: 'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/light/openrouter.png',
    iconDark:
      'https://registry.npmmirror.com/@lobehub/icons-static-png/latest/files/dark/openrouter.png',
  },
} as const;
