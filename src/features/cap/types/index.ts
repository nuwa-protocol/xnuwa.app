// Cap interface for remote caps
export interface RemoteCap {
  id: string;
  name: string;
  tag: string;
  description: string;
  downloads: number;
  version: string;
  author?: string;
  createdAt?: number;
  updatedAt?: number;
  dependencies?: string[];
  size?: number;
}

// Installed Cap interface (minimal data for locally installed caps)
export interface InstalledCap {
  id: string;
  name: string;
  tag: string;
  description: string;
  version: string;
  installDate: number;
  isEnabled?: boolean;
  settings?: Record<string, any>;
}

// Combined cap data: remote + local state
export interface CapDisplayData {
  remote: RemoteCap;
  local?: InstalledCap;
  isInstalled: boolean;
  isEnabled: boolean;
  hasUpdate: boolean;
  installedVersion?: string;
}
