export interface OpenRouterModel {
  id: string;
  name: string;
  created: number;
  description: string;
  architecture: {
    modality?: string | null;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type?: string | null;
  };
  top_provider: {
    is_moderated: boolean;
    context_length?: number;
    max_completion_tokens?: number;
  };
  pricing: {
    prompt: string;
    completion: string;
    image: string;
    request: string;
    web_search: string;
    internal_reasoning: string;
    input_cache_read?: string;
    input_cache_write?: string;
  };
  canonical_slug: string;
  context_length: number;
  hugging_face_id: string | null;
  per_request_limits?: Record<string, any> | null;
  supported_parameters: string[];
}

export interface OpenRouterAPIResponse {
  data: OpenRouterModel[];
}
