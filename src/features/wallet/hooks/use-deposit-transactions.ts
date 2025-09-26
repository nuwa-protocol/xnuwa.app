import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import { fetchDepositTransactions } from '../services/deposit-transactions';
import type { DepositTransaction, DepositTransactionFilter } from '../types';

export const useDepositTransactions = () => {
  const { did: userDid } = useAuth();
  const [depositTransactions, setDepositTransactions] = useState<
    DepositTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(
    async (filters: DepositTransactionFilter = {}) => {
      if (!userDid || isLoading) return;

      try {
        setIsLoading(true);
        const result = await fetchDepositTransactions(userDid, filters);
        console.log('result', result);
        if (result) {
          setDepositTransactions(result.items);
          setTotalCount(result.count);
          setCurrentOffset(result.offset);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch deposit transactions');
      } finally {
        setIsLoading(false);
      }
    },
    [userDid],
  );

  const loadMore = useCallback(
    async (filters: DepositTransactionFilter = {}) => {
      if (!userDid || isLoading) return;

      try {
        const newOffset = currentOffset + (filters.limit || 50);
        const result = await fetchDepositTransactions(userDid, {
          ...filters,
          offset: newOffset,
        });
        setTotalCount(result?.count || 0);
        if (result) {
          setDepositTransactions((prev) => [...prev, ...result.items]);
          setCurrentOffset(result.offset);
          setTotalCount(result.count);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch deposit transactions');
      } finally {
        setIsLoading(false);
      }
    },
    [userDid, currentOffset, isLoading],
  );

  const refresh = useCallback(
    async (filters: DepositTransactionFilter = {}) => {
      setCurrentOffset(0);
      await load(filters);
    },
    [userDid, load],
  );

  const getById = useCallback(
    (orderId: string): DepositTransaction | undefined => {
      return depositTransactions.find(
        (transaction) => transaction.id === orderId,
      );
    },
    [depositTransactions],
  );

  const getByStatus = useCallback(
    (status: string): DepositTransaction[] => {
      return depositTransactions.filter(
        (transaction) => transaction.status === status,
      );
    },
    [depositTransactions],
  );

  useEffect(() => {
    load();
  }, [userDid]);

  return {
    depositTransactions,
    isLoading,
    error,
    totalCount,
    currentOffset,
    load,
    loadMore,
    refresh,
    getById,
    getByStatus,
  };
};
