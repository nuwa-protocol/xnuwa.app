import type { Cap } from '@/shared/types';

export type CapStatus = 'draft' | 'submitted';

export interface LocalCap extends Cap {
  id: string;
  name: string;
  displayName: string;
  description: string;
  tags: string[];
  status: CapStatus;
  cid?: string;
  createdAt: number;
  updatedAt: number;
  did?: string; // Added for IndexedDB storage
}
