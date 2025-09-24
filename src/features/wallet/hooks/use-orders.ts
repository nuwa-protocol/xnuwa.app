import { useState, useCallback, useEffect } from 'react';
import { getConfig } from '@/shared/config/nowpayments';

export interface Order {
  id?: string;
  nowpayments_payment_id: string;
  order_id?: string;
  amount_fiat: number;
  currency_fiat: string;
  status: string;
  pay_currency?: string;
  payer_did?: string;
  transfer_tx?: string | null;
  ipn_payload?: any;
  created_at?: string;
  updated_at?: string;
}

export interface OrdersResponse {
  items: Order[];
  limit: number;
  offset: number;
  count: number;
}

export interface OrdersFilters {
  status?: string[];
  limit?: number;
  offset?: number;
}

export const useOrders = (userDid?: string) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentOffset, setCurrentOffset] = useState(0);

  const fetchOrders = useCallback(async (
    did: string,
    filters: OrdersFilters = {}
  ): Promise<OrdersResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const config = getConfig();
      const { status = [], limit = 50, offset = 0 } = filters;
      
      // 构建查询参数
      const params = new URLSearchParams();
      if (status.length > 0) {
        params.append('status', status.join(','));
      }
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());
      
      const apiUrl = `${config.appUrl}/api/users/${did}/orders?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('获取用户订单失败');
      }

      const data: OrdersResponse = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取订单时发生未知错误';
      setError(errorMessage);
      console.error('Get user orders error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (filters: OrdersFilters = {}) => {
    if (!userDid) {
      setError('用户DID未提供');
      return;
    }

    const result = await fetchOrders(userDid, filters);
    if (result) {
      setOrders(result.items);
      setTotalCount(result.count);
      setCurrentOffset(result.offset);
    }
  }, [userDid, fetchOrders]);

  const loadMoreOrders = useCallback(async (filters: OrdersFilters = {}) => {
    if (!userDid) {
      setError('用户DID未提供');
      return;
    }

    const newOffset = currentOffset + (filters.limit || 50);
    const result = await fetchOrders(userDid, { ...filters, offset: newOffset });
    if (result) {
      setOrders(prev => [...prev, ...result.items]);
      setCurrentOffset(result.offset);
    }
  }, [userDid, currentOffset, fetchOrders]);

  const refreshOrders = useCallback(async (filters: OrdersFilters = {}) => {
    if (!userDid) return;
    
    setCurrentOffset(0);
    await loadOrders(filters);
  }, [userDid, loadOrders]);

  const getOrderById = useCallback((orderId: string): Order | undefined => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  const getOrdersByStatus = useCallback((status: string): Order[] => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 当userDid变化时自动加载订单
  useEffect(() => {
    if (userDid) {
      loadOrders();
    }
  }, [userDid, loadOrders]);

  return {
    orders,
    isLoading,
    error,
    totalCount,
    currentOffset,
    fetchOrders,
    loadOrders,
    loadMoreOrders,
    refreshOrders,
    getOrderById,
    getOrdersByStatus,
    clearError,
  };
};
