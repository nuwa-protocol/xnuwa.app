import type { CapID, CapMetadata, CapStats } from '@/shared/types/cap';

export type RemoteCap = CapID & {
  cid: string;
  version: string;
  metadata: CapMetadata;
  stats: CapStats;
};

export type CapStoreSection = {
  id: string;
  label: string;
  type: 'section' | 'tag' | 'divider';
};
