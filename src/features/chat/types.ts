import type { Message } from 'ai';
import type { Cap } from '@/shared/types';

export interface ChatCap extends Cap {
  id: string;
  name: string;
}

// client chat interface
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  cap: ChatCap;
}
