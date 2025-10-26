import type { ChatSession } from '@/features/chat/types';
import { getHttpClient } from '@/shared/services/payment-clients';
import { getX402TransactionStore } from '@/shared/services/x402-transaction-store';
import type { PaymentTransaction } from '../types';

type TransactionStoreInstance = ReturnType<typeof getX402TransactionStore>;

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
    let legacyStorePromise: Promise<TransactionStoreInstance | null> | null =
      null;

    const getLegacyStore = async () => {
      if (!legacyStorePromise) {
        legacyStorePromise = (async () => {
          try {
            const client = await getHttpClient();
            return client.getTransactionStore();
          } catch (error) {
            console.warn(
              '[wallet] Failed to load legacy transaction store',
              error,
            );
            return null;
          }
        })();
      }
      return legacyStorePromise;
    };

    // loop through all payment ctx ids in each chat session
    const transactionPromises: Promise<PaymentTransaction>[] =
      chatSession.payments.map(async (payment) => {
        const primary = await x402Store.get(payment.ctxId);
        if (primary) {
          return {
            ctxId: payment.ctxId,
            details: primary,
            info: payment,
          };
        }

        const legacyStore = await getLegacyStore();
        const fallback = legacyStore
          ? await legacyStore.get(payment.ctxId)
          : null;

        return {
          ctxId: payment.ctxId,
          details: fallback,
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
