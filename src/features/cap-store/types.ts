import type { Cap, CapID, CapMetadata, CapStats } from '@/shared/types/cap';

export type RemoteCap = CapID & {
  cid: string;
  version: string;
  metadata: CapMetadata;
  stats: CapStats;
};

export type InstalledCap = {
  cid: string;
  capData: Cap;
  version: string;
  isFavorite: boolean;
  stats: CapStats;
  lastUsedAt: number | null;
};

export type CapStoreSection = {
  id: string;
  label: string;
  type: 'section' | 'tag' | 'divider';
};
