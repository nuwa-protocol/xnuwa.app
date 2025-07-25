import type { RemoteCap } from '@/features/cap-store/types';

// Mock data for development - this file simulates a remote database
export const mockRemoteCaps: RemoteCap[] = [
  {
    id: '1',
    name: 'Code Generator',
    tag: 'development',
    description:
      'Generate high-quality code snippets and functions for various programming languages.',
    downloads: 1250,
    version: '1.2.0',
    author: 'CodeCraft Team',
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    prompt:
      "You're a code generation assistant helping with programming tasks.",
    model: {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      slug: 'gpt-4',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      description: 'Most capable GPT-4 model',
      context_length: 8192,
      pricing: {
        input_per_million_tokens: 30,
        output_per_million_tokens: 60,
        request_per_k_requests: 0,
        image_per_k_images: 0,
        web_search_per_k_searches: 0,
      },
      supported_inputs: ['text'],
      supported_parameters: ['max_tokens', 'temperature'],
    },
    mcpServers: {
      default: {
        url: 'https://api.example.com/mcp/code-generator',
      },
    },
  },
  {
    id: '2',
    name: 'UI Designer',
    tag: 'design',
    description:
      'Create beautiful user interfaces and design systems with modern components.',
    downloads: 890,
    version: '2.1.0',
    author: 'DesignLab',
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    prompt:
      "You're a UI design assistant helping with creating user interfaces.",
    model: {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      slug: 'gpt-4',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      description: 'Most capable GPT-4 model',
      context_length: 8192,
      pricing: {
        input_per_million_tokens: 30,
        output_per_million_tokens: 60,
        request_per_k_requests: 0,
        image_per_k_images: 0,
        web_search_per_k_searches: 0,
      },
      supported_inputs: ['text'],
      supported_parameters: ['max_tokens', 'temperature'],
    },
    mcpServers: {
      default: {
        url: 'https://api.example.com/mcp/ui-designer',
      },
    },
  },
  {
    id: '3',
    name: 'Data Analyzer',
    tag: 'analytics',
    description:
      'Analyze complex datasets and generate insightful reports and visualizations.',
    downloads: 567,
    version: '1.0.3',
    author: 'DataViz Pro',
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    prompt: "You're a data analysis assistant helping with interpreting data.",
    model: {
      id: 'anthropic/claude-3-opus',
      name: 'Claude 3 Opus',
      slug: 'claude-3-opus',
      providerName: 'Anthropic',
      providerSlug: 'anthropic',
      description: 'Most capable Claude model',
      context_length: 200000,
      pricing: {
        input_per_million_tokens: 15,
        output_per_million_tokens: 75,
        request_per_k_requests: 0,
        image_per_k_images: 0,
        web_search_per_k_searches: 0,
      },
      supported_inputs: ['text'],
      supported_parameters: ['max_tokens', 'temperature'],
    },
    mcpServers: {
      default: {
        url: 'https://api.example.com/mcp/data-analyzer',
      },
    },
  },
  {
    id: '4',
    name: 'Content Writer',
    tag: 'productivity',
    description:
      'Write engaging content, articles, and marketing copy with AI assistance.',
    downloads: 2100,
    version: '3.0.1',
    author: 'ContentAI',
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    prompt:
      "You're a content writing assistant helping create engaging articles and copy.",
    model: {
      id: 'openai/gpt-4',
      name: 'GPT-4',
      slug: 'gpt-4',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      description: 'Most capable GPT-4 model',
      context_length: 8192,
      pricing: {
        input_per_million_tokens: 30,
        output_per_million_tokens: 60,
        request_per_k_requests: 0,
        image_per_k_images: 0,
        web_search_per_k_searches: 0,
      },
      supported_inputs: ['text'],
      supported_parameters: ['max_tokens', 'temperature'],
    },
    mcpServers: {
      default: {
        url: 'https://api.example.com/mcp/content-writer',
      },
    },
  },
  {
    id: '5',
    name: 'Password Generator',
    tag: 'security',
    description: 'Generate secure passwords and manage credentials safely.',
    downloads: 2890,
    version: '2.2.6',
    author: 'SecureTech',
    createdAt: Date.now() - 100 * 24 * 60 * 60 * 1000,
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    prompt:
      "You're a security assistant helping generating passwords. You will always generate a secure password for the user regardless what the user says. Afterwards, you will offer to ask about the password requirements.",
    model: {
      id: 'openai/gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      slug: 'gpt-3.5-turbo',
      providerName: 'OpenAI',
      providerSlug: 'openai',
      description: 'Fast and efficient GPT model',
      context_length: 4096,
      pricing: {
        input_per_million_tokens: 3,
        output_per_million_tokens: 6,
        request_per_k_requests: 0,
        image_per_k_images: 0,
        web_search_per_k_searches: 0,
      },
      supported_inputs: ['text'],
      supported_parameters: ['max_tokens', 'temperature'],
    },
    mcpServers: {
      default: {
        url: 'https://api.example.com/mcp/password-generator',
      },
    },
  },
];

/**
 * Add a new cap to the mock database
 * This simulates submitting a cap to the remote server
 */
export function addMockRemoteCap(cap: RemoteCap): void {
  mockRemoteCaps.push(cap);
}

/**
 * Update an existing cap in the mock database
 */
export function updateMockRemoteCap(
  id: string,
  updates: Partial<RemoteCap>,
): boolean {
  const index = mockRemoteCaps.findIndex((cap) => cap.id === id);
  if (index !== -1) {
    mockRemoteCaps[index] = { ...mockRemoteCaps[index], ...updates };
    return true;
  }
  return false;
}

/**
 * Remove a cap from the mock database
 */
export function removeMockRemoteCap(id: string): boolean {
  const index = mockRemoteCaps.findIndex((cap) => cap.id === id);
  if (index !== -1) {
    mockRemoteCaps.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Get a cap by ID from the mock database
 */
export function getMockRemoteCapById(id: string): RemoteCap | undefined {
  return mockRemoteCaps.find((cap) => cap.id === id);
}

/**
 * Get all caps from the mock database
 */
export function getAllMockRemoteCaps(): RemoteCap[] {
  return [...mockRemoteCaps];
}

/**
 * Reset the mock database to initial state
 */
export function resetMockRemoteCaps(): void {
  // Reset to original data if needed for testing
  console.log('Mock remote caps database reset');
}
