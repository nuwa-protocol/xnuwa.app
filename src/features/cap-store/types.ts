import type { Cap, CapID, CapMetadata } from '@/shared/types/cap';

export type RemoteCap = CapID & {
  cid: string;
  version: string;
  metadata: CapMetadata;
};

export type InstalledCap = {
  capData: Cap;
  isFavorite: boolean;
  lastUsedAt: number | null;
};
