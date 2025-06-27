import type { Message } from "ai";

// client chat interface
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

// stream ID management interface
export interface StreamRecord {
  id: string;
  chatId: string;
  createdAt: number;
}

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
  };
  canonical_slug: string;
  context_length: number;
  hugging_face_id: string | null;
  per_request_limits?: Record<string, any> | null;
  supported_parameters: string[];
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

// Unified model selection interface
export interface SelectedModel {
  id: string;
  provider: string;
  name: string;
  supported_parameters: string[];
}
