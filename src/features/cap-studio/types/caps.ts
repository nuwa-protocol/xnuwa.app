import type { Model } from '@/shared/types';

export type CapStatus = 'draft' | 'submitted';

export interface LocalCap {
  id: string;
  name: string;
  description: string;
  tag: string;
  prompt: string;
  model: Model;
  mcpServers: Record<string, { url: string }>;
  status: CapStatus;
  createdAt: number;
  updatedAt: number;
}
