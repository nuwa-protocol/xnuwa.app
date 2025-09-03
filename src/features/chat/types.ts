import type { UIMessage } from 'ai';
import type { Cap } from '@/shared/types';

export type ChatPaymentType = 'generate-title' | 'chat-message';

export interface ChatPayment {
  type: ChatPaymentType;
  message?: string;
  ctxId: string;
  timestamp: number;
}

// client chat interface
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
  payments: ChatPayment[];
  caps: Cap[];
  pinned?: boolean;
  did?: string; // Added for IndexedDB storage
}

export interface UrlMetadata {
  url?: string;
  title?: string;
  description?: string;
  image?: string;
  favicons?: Array<{
    rel: string;
    href: string;
    sizes?: string;
  }>;
  'og:image'?: string;
  'og:site_name'?: string;
  'og:title'?: string;
  'og:description'?: string;
  publisher?: string;
}
