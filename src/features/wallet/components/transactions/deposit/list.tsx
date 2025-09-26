import { useEffect, useMemo, useState } from 'react';
import { useDepositOrders } from '@/features/wallet/hooks/use-deposit-orders';
import type {
  DepositOrder,
  FetchDepositOrdersFilter,
  SortOption,
} from '@/features/wallet/types';
import { Button } from '@/shared/components/ui/button';
import {
  DepositEmpty,
  DepositError,
  DepositLoading,
  DepositSearchEmpty,
} from './abnormal';
import { DepositTransactionDetailsModal } from './details-modal';
import { DepositTransactionsFilter } from './filter';
import { DepositTransactionItem } from './item';
import { DepositTransactionSearch } from './search';

export function DepositTransctionList() {
  const {
    depositOrders,
    isLoading,
    error,
    totalCount,
    loadMore,
    refresh,
  } = useDepositOrders();

  const [selectedOrder, setSelectedOrder] =
    useState<DepositOrder | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('time-desc');
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined);
  const [status, setStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const processedTransactions = useMemo(() => {
    return getProcessedTransactions(depositOrders, {
      sortBy,
      filterDate,
      status,
      searchTerm,
    });
  }, [depositOrders, sortBy, filterDate, status, searchTerm]);

  const handleRefresh = () => {
    const filters: FetchDepositOrdersFilter = {};
    if (status !== 'all') filters.status = [status];
    refresh(filters);
  };

  const handleLoadMore = () => {
    const filters: FetchDepositOrdersFilter = {};
    if (status !== 'all') filters.status = [status];
    loadMore(filters);
  };

  // When status changes, refresh from server with server-side status filter
  // so pagination and counts reflect the selected status.
  // Note: local filters (search/date/sort) are still applied client-side.
  useEffect(() => {
    const filters: FetchDepositOrdersFilter = {};
    if (status !== 'all') filters.status = [status];
    refresh(filters);
  }, [status]);

  if (error) return <DepositError onRetry={handleRefresh} />;

  if (isLoading && depositOrders.length === 0) return <DepositLoading />;

  if (!isLoading && depositOrders.length === 0 && status === 'all')
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

      {processedTransactions.length === 0 ? (
        <DepositSearchEmpty
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          status={status}
          setStatus={setStatus}
        />
      ) : (
        processedTransactions.map((transaction) => (
          <DepositTransactionItem
            key={transaction.paymentId}
            transaction={transaction}
            onSelect={setSelectedOrder}
          />
        ))
      )}

      {depositOrders.length < totalCount && (
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
        transaction={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

export function getProcessedTransactions(
  depositOrders: DepositOrder[],
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
  let filtered = [...depositOrders];

  // Filter by status (client-side)
  if (status && status !== 'all') {
    filtered = filtered.filter((t) => t.status === status);
  }

  // Filter by date (created_at within the selected day)
  if (filterDate) {
    const start = new Date(filterDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filterDate);
    end.setHours(23, 59, 59, 999);
    filtered = filtered.filter((o) => {
      if (!o.createdAt) return false;
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }

  // Search by order_id only
  const q = (searchTerm || '').trim().toLowerCase();
  if (q) {
    filtered = filtered.filter((t) =>
      (t.orderId || '').toLowerCase().includes(q),
    );
  }

  // Sort
  return filtered.sort((a, b) => {
    switch (sortBy) {
      case 'time-asc': {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return ta - tb;
      }
      case 'time-desc': {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
      case 'amount-asc': {
        const aa = Number(a.purchasedAmount || 0);
        const ab = Number(b.purchasedAmount || 0);
        return aa - ab;
      }
      case 'amount-desc': {
        const aa = Number(a.purchasedAmount || 0);
        const ab = Number(b.purchasedAmount || 0);
        return ab - aa;
      }
      default: {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }
    }
  });
}
