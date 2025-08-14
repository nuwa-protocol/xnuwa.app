import { useCallback, useEffect, useState } from 'react';
import { getHttpClient } from '@/shared/services/payment-clients';
import type { TransactionRecord, TransactionStore } from '@nuwa-ai/payment-kit';

export function useTransactions(limit = 50) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [store, setStore] = useState<TransactionStore | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const client = await getHttpClient();
      const txStore = client.getTransactionStore();
      setStore(txStore);
      const res = await txStore.list({}, { limit });
      setItems(res.items);
      setError(null);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      await load();
      try {
        if (store && store.subscribe) {
          unsub = store.subscribe(() => {
            // naive: just reload on any change
            load();
          });
        }
      } catch {}
    })();
    return () => {
      if (unsub) {
        try { unsub(); } catch {}
      }
    };
  }, [load, store]);

  return { loading, error, items, reload: load };
}


