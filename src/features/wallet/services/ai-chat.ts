import type { ChatSession } from '@/features/chat/types';
import { getX402TransactionStore } from '@/x402/x402-transaction-store';
import type { PaymentTransaction } from '../types';

export const fetchTransactionsFromChatSession = async (
  chatSession: ChatSession,
): Promise<PaymentTransaction[]> => {
  if (
    !chatSession ||
    !chatSession.payments ||
    chatSession.payments.length === 0
  ) {
    return [];
  }
  try {
    const x402Store = getX402TransactionStore();

    // loop through all payment ctx ids in each chat session
    const transactionPromises: Promise<PaymentTransaction>[] =
      chatSession.payments.map(async (payment) => {
        const primary = await x402Store.get(payment.ctxId);
        return {
          ctxId: payment.ctxId,
          details: primary ?? null,
          info: payment,
        };
      });

    const transactions = await Promise.all(transactionPromises);

    return transactions;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch transactions');
  }
};
