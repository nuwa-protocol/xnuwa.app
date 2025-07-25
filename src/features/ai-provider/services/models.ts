// This file is kept for potential future model functionality
// Currently no model selection is needed

import { ModelStateStore } from '../stores';
import type { Model, OpenRouterAPIResponse, OpenRouterModel } from '../types';
import { createAuthorizedFetch } from './fetch';

/**
 * Fetches the list of available models from OpenRouter API.
 * @returns {Promise<OpenRouterAPIResponse>} The list of available models.
 */
async function fetchOpenRouterModels(): Promise<OpenRouterAPIResponse> {
  const authorizedFetch = createAuthorizedFetch();
  // TODO: change to nuwa endpoint - need to improve the speed of nuwa endpoint
  const endpoint = 'https://test-llm.nuwa.dev/api/v1/models';
  // const endpoint = 'https://openrouter.ai/api/v1/models';

  try {
    const response = await authorizedFetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(
        `Failed to fetch models: ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}

function parseModelInfo(model: OpenRouterModel) {
  const id = model.id;
  const baseId = model.id.split(':')[0];
  const [providerSlug, ...slugParts] = baseId.split('/');
  const slug = slugParts.join('/');

  let providerName = '';
  let name = '';
  if (model.name.includes(':')) {
    [providerName, name] = model.name.split(':');
    providerName = providerName.trim();
  } else {
    name = model.name;
    providerName = providerSlug;
  }

  return {
    id,
    name,
    slug,
    providerName,
    providerSlug,
  };
}

export async function fetchAvailableModels(): Promise<Model[]> {
  const openRouterModels = await fetchOpenRouterModels();

  return openRouterModels.data
    .filter((model: OpenRouterModel) => !model.id.includes('openrouter')) // exclude openrouter models
    .map((model: OpenRouterModel) => {
      return {
        ...parseModelInfo(model),
        description: model.description,
        context_length: model.context_length,
        pricing: {
          input_per_million_tokens: parseFloat(model.pricing.prompt) * 1000000,
          output_per_million_tokens:
            parseFloat(model.pricing.completion) * 1000000,
          request_per_k_requests: parseFloat(model.pricing.request) * 1000,
          image_per_k_images: parseFloat(model.pricing.image) * 1000,
          web_search_per_k_searches:
            parseFloat(model.pricing.web_search) * 1000,
        },
        supported_inputs: model.architecture.input_modalities,
        supported_parameters: model.supported_parameters,
      };
    });
}

export const getModelSettings = (): {
  modelId: string;
} => {
  // get state from store
  const selectedModel = ModelStateStore.getState().selectedModel;

  return {
    modelId: selectedModel.id,
  };
};
