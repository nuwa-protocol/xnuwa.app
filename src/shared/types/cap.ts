import type { Model } from './model';

export interface McpServerConfig {
  url: string;
  transport: 'httpStream' | 'sse';
}

export interface Prompt {
  value: string;
  suggestions?: string[];
}

// Cap Data Interface
export interface Cap {
  prompt: Prompt;
  model: Model;
  mcpServers: Record<string, McpServerConfig>;
}
