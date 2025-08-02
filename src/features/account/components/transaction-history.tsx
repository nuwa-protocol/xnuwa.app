import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useAccountData } from '../hooks/use-account-data';
import type { Transaction } from '../services/account-api';

function TransactionRow({
  transaction,
  showUSD,
  usdRate,
}: {
  transaction: Transaction;
  showUSD: boolean;
  usdRate: number;
}) {
  const isCredit =
    transaction.type === 'credit' || transaction.type === 'top_up';
  const amountColor = isCredit ? 'text-green-600' : 'text-red-600';
  const amountPrefix = isCredit ? '+' : '-';

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const baseClasses =
      'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium';

    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'failed':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{transaction.description}</span>
          <span className={getStatusBadge(transaction.status)}>
            {transaction.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(transaction.timestamp)}
        </p>
      </div>
      <div className={`font-semibold ${amountColor}`}>
        {showUSD
          ? `${amountPrefix}$${(transaction.amount * usdRate).toFixed(2)} USD`
          : `${amountPrefix}${transaction.amount.toLocaleString()} $NUWA`}
      </div>
    </div>
  );
}

export function TransactionHistory({ showUSD }: { showUSD: boolean }) {
  const { transactions, balance } = useAccountData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No transactions found
          </p>
        ) : (
          <div className="space-y-0">
            {transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                showUSD={showUSD}
                usdRate={balance.usdRate}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
