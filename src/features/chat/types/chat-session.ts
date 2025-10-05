import type { LanguageModelUsage, UIMessage } from 'ai';
import type { LocalCap } from '@/features/cap-studio/types';
import type { Cap } from '@/shared/types';

export type ChatPaymentType = 'generate-title' | 'chat-message' | 'ai-request';

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

export interface ChatArtifactState {
  value: any;
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
  // Track multiple caps used in a single chat session. The last item is the most recently used.
  caps: (Cap | LocalCap)[];
  artifactState?: ChatArtifactState;
  selections?: ChatSelection[];
  contextUsage: LanguageModelUsage;
  pinned?: boolean;
}
