import type { ChatSession } from '@/features/chat/types';
import { getHttpClient } from '@/shared/services/payment-clients';
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
    const client = await getHttpClient();
    const txStore = client.getTransactionStore();

    // loop through all payment ctx ids in each chat session
    const transactionPromises: Promise<PaymentTransaction>[] =
      chatSession.payments.map(async (payment) => {
        const res = await txStore.get(payment.ctxId);
        if (res) {
          return {
            ctxId: payment.ctxId,
            details: res,
            info: payment,
          };
        } else {
          return {
            ctxId: payment.ctxId,
            details: null,
            info: payment,
          };
        }
      });

    const transactions = await Promise.all(transactionPromises);

    return transactions;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch transactions');
  }
};
