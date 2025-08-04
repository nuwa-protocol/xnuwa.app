export interface CapMcpServerConfig {
  url: string;
  transport: 'httpStream' | 'sse';
}

export interface CapModel {
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

export interface CapPrompt {
  value: string;
  suggestions?: string[];
}

// Cap Data Interface
export interface CapID {
  idName: string;
}

export interface CapCore {
  prompt: CapPrompt;
  model: CapModel;
  mcpServers: Record<string, CapMcpServerConfig>;
}

export interface CapMetadata {
  displayName: string;
  description: string;
  author: string;
  tags: string[];
  submittedAt: number;
  homepage?: string;
  repository?: string;
  thumbnail?: string;
}

// Cap data interface for Cap Store
export interface Cap extends CapID {
  core: CapCore;
  metadata: CapMetadata;
}
