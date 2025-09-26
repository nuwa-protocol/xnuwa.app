import type { TransactionRecord } from '@nuwa-ai/payment-kit';
import type { ChatPayment } from '@/features/chat/types';

export interface PaymentTransaction {
  ctxId: string;
  details: TransactionRecord | null;
  info: ChatPayment;
}

export interface ChatSessionTransactionRecords {
  chatId: string;
  chatTitle: string;
  transactions: PaymentTransaction[];
}

export type SortOption =
  | 'time-desc'
  | 'time-asc'
  | 'amount-desc'
  | 'amount-asc';
