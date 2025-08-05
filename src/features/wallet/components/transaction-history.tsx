import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useNuwaToUsdRate } from '../hooks/use-nuwa-to-usd-rate';
import { useWallet } from '../hooks/use-wallet';
import type { Transaction } from '../types';

function TransactionRow({ transaction }: { transaction: Transaction }) {
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

  const usdValue = transaction.amount.toFixed(6).toLocaleString();
  const nuwaValue = (transaction.amount * nuwaToUsdRate).toFixed(6);

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
      <div className={`font-semibold ${amountColor} flex flex-col items-end`}>
        <div>{`${amountPrefix}$${usdValue} USD`}</div>
        <div className="text-muted-foreground text-xs">
          {`${amountPrefix}${nuwaValue} $NUWA`}
        </div>
      </div>
    </div>
  );
}

export function TransactionHistory() {
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
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
