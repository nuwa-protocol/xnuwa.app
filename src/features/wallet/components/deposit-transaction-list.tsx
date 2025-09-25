import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/hooks/use-auth';
import { type Order, type OrdersFilters, useOrders } from '../hooks/use-deposit-orders';
import type { SortOption } from '../types';
import {
  DepositEmpty,
  DepositError,
  DepositLoading,
  DepositSearchEmpty,
} from './deposit-transaction-abnormal';
import { DepositTransactionDetailsModal } from './deposit-transaction-details-modal';
import { DepositTransactionsFilter } from './deposit-transaction-filter';
import { DepositTransactionItem } from './deposit-transaction-item';
import { DepositTransactionSearch } from './deposit-transaction-search';

export function DepositTransctionList() {
  const { did } = useAuth();
  const {
    orders,
    isLoading,
    error,
    totalCount,
    loadMoreOrders,
    refreshOrders,
    clearError,
  } = useOrders(did ?? undefined);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('time-desc');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const processedOrders = useMemo(() => {
    return getProcessedOrders(orders, {
      sortBy,
      filterDate,
      status,
      searchTerm,
    });
  }, [orders, sortBy, filterDate, status, searchTerm]);

  const handleRefresh = () => {
    clearError();
    const filters: OrdersFilters = {};
    if (status !== 'all') filters.status = [status];
    refreshOrders(filters);
  };

  const handleLoadMore = () => {
    const filters: OrdersFilters = {};
    if (status !== 'all') filters.status = [status];
    loadMoreOrders(filters);
  };

  // When status changes, refresh from server with server-side status filter
  // so pagination and counts reflect the selected status.
  // Note: local filters (search/date/sort) are still applied client-side.
  useEffect(() => {
    const filters: OrdersFilters = {};
    if (status !== 'all') filters.status = [status];
    refreshOrders(filters);
  }, [status, did, refreshOrders]);

  if (error) return <DepositError onRetry={handleRefresh} />;

  if (isLoading && orders.length === 0) return <DepositLoading />;

  if (!isLoading && orders.length === 0 && status === 'all')
    return <DepositEmpty onRetry={handleRefresh} />;

  return (
    <div className="flex flex-col w-full">
      <div className="sticky top-0 z-20 flex flex-row items-center justify-between gap-3 px-4 py-2 bg-background">
        <DepositTransactionSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <DepositTransactionsFilter
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          status={status}
          setStatus={setStatus}
        />

      </div>

      {processedOrders.length === 0 ? (
        <DepositSearchEmpty
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          status={status}
          setStatus={setStatus}
        />
      ) : (
        processedOrders.map((order) => (
          <DepositTransactionItem
            key={order.nowpayments_payment_id}
            order={order}
            onSelect={setSelectedOrder}
          />
        ))
      )}

      {orders.length < totalCount && (
        <div className="flex justify-center my-3">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      <DepositTransactionDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export function getProcessedOrders(
  orders: Order[],
  {
    sortBy,
    filterDate,
    status,
    searchTerm,
  }: {
    sortBy: SortOption;
    filterDate?: Date;
    status: string;
    searchTerm?: string;
  },
) {
  let filtered = [...orders];

  // Filter by status (client-side)
  if (status && status !== 'all') {
    filtered = filtered.filter((o) => o.status === status);
  }

  // Filter by date (created_at within the selected day)
  if (filterDate) {
    const start = new Date(filterDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filterDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((o) => {
      if (!o.created_at) return false;
      const t = new Date(o.created_at).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }

  // Search by order_id only
  const q = (searchTerm || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((o) =>
      (o.order_id || '').toLowerCase().includes(q),
    );
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'time-asc': {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return ta - tb;
      }
      case 'time-desc': {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      }
      case 'amount-asc': {
        const aa = Number(a.amount_fiat || 0);
        const ab = Number(b.amount_fiat || 0);
        return aa - ab;
      }
      case 'amount-desc': {
        const aa = Number(a.amount_fiat || 0);
        const ab = Number(b.amount_fiat || 0);
        return ab - aa;
      }
      default: {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta;
      }
    }
  });
}
