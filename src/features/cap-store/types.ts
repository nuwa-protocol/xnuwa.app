import type { Cap } from '@/shared/types/cap';

// Remote Cap Interface
export interface RemoteCap extends Cap {
  id: string;
  name: string;
  tag: string;
  description: string;
  downloads: number;
  version: string;
  author: string;
  createdAt: number;
  updatedAt: number;
}

// Installed Cap interface (minimal data for locally installed caps)
export interface InstalledCap extends Cap {
  id: string;
  name: string;
  tag: string;
  description: string;
  version: string;
  updatedAt: number;
}
