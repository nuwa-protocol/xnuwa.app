import type { Message } from 'ai';

// client chat interface
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
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
