import type { Model } from '../types';
import { useSelectedModel } from './use-selected-model';

export const useSelectAuto = () => {
  const { setSelectedModel } = useSelectedModel();

  const AUTO_MODEL: Model = {
    id: 'openrouter/auto',
    name: 'Auto',
    slug: 'auto',
    providerName: 'Auto',
    providerSlug: 'auto',
    description: 'Automatically select the best model based on your needs.',
    context_length: 0,
    pricing: {
      input_per_million_tokens: 0,
      output_per_million_tokens: 0,
      request_per_k_requests: 0,
      image_per_k_images: 0,
      web_search_per_k_searches: 0,
    },
    supported_inputs: [],
    supported_parameters: [],
  };

  const SetModelAuto = () => {
    setSelectedModel(AUTO_MODEL);
  };

  return {
    SetModelAuto,
  };
};
