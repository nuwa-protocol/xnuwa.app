import type { X402TransactionRecord } from '@/shared/services/x402-transaction-store';
import type { TransactionRecord as LegacyTransactionRecord } from '@nuwa-ai/payment-kit';
import type { ChatPayment } from '@/features/chat/types';

export type WalletTransactionDetails = X402TransactionRecord | LegacyTransactionRecord;

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
