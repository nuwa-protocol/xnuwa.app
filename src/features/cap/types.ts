interface Model {
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

// Cap Data Interface
interface CapData {
  prompt: string;
  model: Model;
  mcpServers: {
    [name: string]: {
      url: string;
    };
  };
}

// Remote Cap Interface
export interface RemoteCap extends CapData {
  id: string;
  name: string;
  tag: string;
  description: string;
  downloads: number;
  version: string;
  author: string;
  createdAt: number;
  updatedAt: number;
}

// Installed Cap interface (minimal data for locally installed caps)
export interface InstalledCap extends CapData {
  id: string;
  name: string;
  tag: string;
  description: string;
  version: string;
  updatedAt: number;
}
