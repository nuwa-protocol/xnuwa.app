import { StatusBadge } from '@/features/wallet/components/status-badge';
import type { DepositOrder } from '@/features/wallet/types';
import { Button } from '@/shared/components/ui/button';

function formatAbsolute(dateStr?: string) {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString();
}

function formatAmount(amount: number) {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 4,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} USD`;
  }
}

export function DepositTransactionItem({
  transaction,
  onSelect,
}: {
  transaction: DepositOrder;
  onSelect: (order: DepositOrder) => void;
}) {
  // Decide how to render the transferred amount on the right.
  // Show "+" only when there's a positive credited amount; otherwise no sign.
  const transferred = Number(transaction.transferredAmount || 0);
  const showPlus = transferred > 0;
  const amountClass =
    transferred > 0
      ? 'text-green-600'
      : transferred < 0
        ? 'text-red-600'
        : 'text-muted-foreground';

  return (
    <Button
      variant="ghost"
      className="w-full justify-between py-4 h-auto hover:bg-muted/50"
      onClick={() => onSelect(transaction)}
    >
      <div className="text-left">
        <p className="font-medium truncate max-w-[220px]">
          Deposit Order of {formatAmount(
            Number(transaction.purchasedAmount || 0)
          )} USD
        </p>
        <p className="text-xs text-muted-foreground">
          {formatAbsolute(transaction.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end space-x-1 text-sm font-medium">
          <span className={amountClass}>
            {showPlus ? '+ ' : ''}
            {formatAmount(transferred)}
          </span>
        </div>
        <div className="mt-1">
          <StatusBadge status={transaction.status} />
        </div>
      </div>
    </Button>
  );
}
