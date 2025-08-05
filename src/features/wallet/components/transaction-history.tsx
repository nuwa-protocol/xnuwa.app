import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useNuwaToUsdRate } from '../hooks/use-nuwa-to-usd-rate';
import { useWallet } from '../hooks/use-wallet';
import type { Transaction } from '../types';

function TransactionRow({
  transaction,
  showUSD,
}: {
  transaction: Transaction;
  showUSD: boolean;
}) {
  const nuwaToUsdRate = useNuwaToUsdRate();
  const amountColor =
    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600';
  const amountPrefix = transaction.type === 'deposit' ? '+' : '-';

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
      case 'confirming':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{transaction.label}</span>
          <span className={getStatusBadge(transaction.status)}>
            {transaction.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(transaction.timestamp.toString())}
        </p>
      </div>
      <div className={`font-semibold ${amountColor}`}>
        {showUSD
          ? `${amountPrefix}$${(transaction.amount).toFixed(6)} USD`
          : `${amountPrefix}${(transaction.amount * nuwaToUsdRate).toLocaleString()} $NUWA`}
      </div>
    </div>
  );
}

export function TransactionHistory({ showUSD }: { showUSD: boolean }) {
  const { transactions } = useWallet();
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
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
