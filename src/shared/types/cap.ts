import type { Model } from './model';

// Cap Data Interface
export interface Cap {
  prompt: string;
  model: Model;
  mcpServers: {
    [name: string]: {
      url: string;
    };
  };
}
