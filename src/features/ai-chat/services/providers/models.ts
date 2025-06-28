// This file is kept for potential future model functionality
// Currently no model selection is needed

import { createAuthorizedFetch } from './fetch';
import type { OpenRouterModelsResponse } from '../../types';

/**
 * Fetches the list of available models from OpenRouter API.
 * @returns {Promise<OpenRouterModelsResponse>} The list of available models.
 */
export async function fetchAvailableModels(): Promise<OpenRouterModelsResponse> {
  const authorizedFetch = createAuthorizedFetch();
// TODO: change to nuwa endpoint - need to improve the speed of nuwa endpoint
//   const endpoint = 'https://test-llm.nuwa.dev/api/v1/models';
  const endpoint = 'https://openrouter.ai/api/v1/models';

  try {
    const response = await authorizedFetch(endpoint, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching available models:', error);
    throw error;
  }
}

