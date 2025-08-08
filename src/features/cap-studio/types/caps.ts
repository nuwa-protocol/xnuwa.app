import type { Cap } from '@/shared/types';

export type DevCapStatus = 'draft' | 'submitted';

export interface LocalCap {
  id: string;
  capData: Cap;
  status: DevCapStatus;
  cid?: string;
  createdAt: number;
  updatedAt: number;
  did?: string; // Added for IndexedDB storage
}
