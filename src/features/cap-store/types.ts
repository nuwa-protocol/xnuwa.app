import type { Cap, CapID, CapMetadata } from '@/shared/types/cap';

export type RemoteCap = CapID & {
  cid: string;
  version: string;
  metadata: CapMetadata;
};

export type InstalledCap = {
  cid: string;
  capData: Cap;
  isFavorite: boolean;
  lastUsedAt: number | null;
};

export type CapStoreSidebarSection = {
  id: string;
  label: string;
  type: 'section' | 'tag' | 'divider';
};
