import { Button } from '@/shared/components/ui/button';
import type { DepositTransaction } from '../../types';
import { StatusBadge } from '../buy-credits/step-payment/status-badge';

function formatAbsolute(dateStr?: string) {
  if (!dateStr) return 'No date';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Invalid date';
  return d.toLocaleString();
}

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 4,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function DepositTransactionItem({
  transaction,
  onSelect,
}: {
  transaction: DepositTransaction;
  onSelect: (order: DepositTransaction) => void;
}) {
  const orderId = transaction.order_id || transaction.nowpayments_payment_id;
  return (
    <Button
      variant="ghost"
      className="w-full justify-between py-4 h-auto hover:bg-muted/50"
      onClick={() => onSelect(transaction)}
    >
      <div className="text-left">
        <p className="font-medium truncate max-w-[220px]">
          {orderId || 'Order'}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatAbsolute(transaction.created_at)}
        </p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end space-x-1 text-sm font-medium">
          <span>
            {formatAmount(
              Number(transaction.amount_fiat || 0),
              transaction.currency_fiat,
            )}
          </span>
        </div>
        <div className="mt-1">
          <StatusBadge status={transaction.status} />
        </div>
      </div>
    </Button>
  );
}
