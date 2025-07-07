
// Cap Data Interface
interface CapData {
  prompt: string;
  modelId:string;
  mcpUrl:string[];
}

// Remote Cap Interface
export interface RemoteCap extends CapData {
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
export interface InstalledCap extends CapData {
  id: string;
  name: string;
  tag: string;
  description: string;
  version: string;
  updatedAt: number;
}