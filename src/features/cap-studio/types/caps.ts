import type { Model } from '@/shared/types';

export type CapStatus = 'draft' | 'submitted';

export interface McpServerConfig {
  name: string;
  url: string;
  transport: 'sse' | 'http-stream';
}

export interface LocalCap {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tag: string;
  prompt: string;
  model: Model;
  mcpServers: Record<string, McpServerConfig>;
  status: CapStatus;
  createdAt: number;
  updatedAt: number;
}
