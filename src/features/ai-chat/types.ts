import type { Message } from 'ai';
import type { InstalledCap } from '@/features/cap/types';

// client chat interface
export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  cap: InstalledCap | null;
}