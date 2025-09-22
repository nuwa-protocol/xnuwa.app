import type { UIMessage } from 'ai';
import type { Cap } from '@/shared/types';

export type ChatPaymentType = 'generate-title' | 'chat-message';

export interface ChatPayment {
  type: ChatPaymentType;
  message?: string;
  ctxId: string;
  timestamp: number;
}

export interface ChatSelection {
  id: string;
  label: string;
  message: string;
}

export interface ChatArtifact {
  state: any;
  updatedAt: number;
}

// client chat interface
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
  payments: ChatPayment[];
  cap: Cap;
  artifact?: ChatArtifact;
  selections?: ChatSelection[];
  pinned?: boolean;
}
