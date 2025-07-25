export interface Model {
    id: string;
    name: string;
    slug: string;
    providerName: string;
    providerSlug: string;
    description: string;
    context_length: number;
    pricing: {
      input_per_million_tokens: number;
      output_per_million_tokens: number;
      request_per_k_requests: number;
      image_per_k_images: number;
      web_search_per_k_searches: number;
    };
    supported_inputs: string[];
    supported_parameters: string[];
  }