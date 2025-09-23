import type { Cap } from '../types';

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
      modelType: 'Language Model',
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
