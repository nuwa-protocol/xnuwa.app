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
