import type { ChatPayment } from '@/features/chat/types';
import type { X402TransactionRecord } from '@/shared/services/x402-transaction-store';

export type WalletTransactionDetails = X402TransactionRecord;

export interface PaymentTransaction {
  ctxId: string;
  details: WalletTransactionDetails | null;
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
