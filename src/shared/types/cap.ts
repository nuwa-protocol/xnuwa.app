import type { Model } from './model';

export interface McpServerConfig {
  url: string;
  transport: 'httpStream' | 'sse';
}

// Cap Data Interface
export interface Cap {
  prompt: string;
  model: Model;
  mcpServers: Record<string, McpServerConfig>;
}
