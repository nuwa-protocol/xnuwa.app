import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/use-auth';
import { fetchDepositOrders } from '../services/deposit';
import type {
  DepositOrder,
  FetchDepositOrdersFilter,
  FetchDepositOrdersResponse,
} from '../types';
import { mapFetchDepositOrdersResponseItemToPaymentOrder } from '../utils';

export const useDepositOrders = () => {
  const { did: userDid } = useAuth();
  const [depositOrders, setDepositOrders] = useState<DepositOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const load = useCallback(
    async (filters: FetchDepositOrdersFilter = {}) => {
      if (!userDid || isLoading) return;

      try {
        setIsLoading(true);
        const result: FetchDepositOrdersResponse = await fetchDepositOrders(
          userDid,
          filters,
        );
        if (result) {
          const depositOrders = result.items.map(
            mapFetchDepositOrdersResponseItemToPaymentOrder,
          );
          setDepositOrders(depositOrders);
          setTotalCount(result.count);
          setCurrentOffset(result.offset);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch deposit orders');
      } finally {
        setIsLoading(false);
      }
    },
    [userDid],
  );

  const loadMore = useCallback(
    async (filters: FetchDepositOrdersFilter = {}) => {
      if (!userDid || isLoading) return;

      try {
        const newOffset = currentOffset + (filters.limit || 50);
        const result = await fetchDepositOrders(userDid, {
          ...filters,
          offset: newOffset,
        });
        setTotalCount(result?.count || 0);
        if (result) {
          const depositOrders = result.items.map(
            mapFetchDepositOrdersResponseItemToPaymentOrder,
          );
          setDepositOrders((prev) => [...prev, ...depositOrders]);
          setCurrentOffset(result.offset);
          setTotalCount(result.count);
          setError(null);
        }
      } catch (err) {
        setError('Failed to fetch deposit orders');
      } finally {
        setIsLoading(false);
      }
    },
    [userDid, currentOffset, isLoading],
  );

  const refresh = useCallback(
    async (filters: FetchDepositOrdersFilter = {}) => {
      setCurrentOffset(0);
      await load(filters);
    },
    [userDid, load],
  );

  const getById = useCallback(
    (orderId: string): DepositOrder | undefined => {
      return depositOrders.find((order) => order.orderId === orderId);
    },
    [depositOrders],
  );

  const getByStatus = useCallback(
    (status: string): DepositOrder[] => {
      return depositOrders.filter((order) => order.status === status);
    },
    [depositOrders],
  );

  useEffect(() => {
    load();
  }, [userDid]);

  return {
    depositOrders,
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
