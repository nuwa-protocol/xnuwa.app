import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import type { Order } from '../hooks/use-orders';

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

function statusVariant(status: string): React.ComponentProps<typeof Badge>['variant'] {
  switch (status) {
    case 'completed':
      return 'default';
    case 'processing':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'failed':
      return 'destructive';
    case 'cancelled':
      return 'secondary';
    default:
      return 'outline';
  }
}

function statusColorClasses(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 border-green-200 dark:border-green-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    case 'pending':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-200 dark:border-amber-800';
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-200 dark:border-red-800';
    case 'cancelled':
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800';
    default:
      return '';
  }
}

export function DepositTransactionItem({
  order,
  onSelect,
}: {
  order: Order;
  onSelect: (order: Order) => void;
}) {
  const orderId = order.order_id || order.nowpayments_payment_id;
  return (
    <Button
      variant="ghost"
      className="w-full justify-between py-4 h-auto hover:bg-muted/50"
      onClick={() => onSelect(order)}
    >
      <div className="text-left">
        <p className="font-medium truncate max-w-[220px]">{orderId || 'Order'}</p>
        <p className="text-xs text-muted-foreground">{formatAbsolute(order.created_at)}</p>
      </div>
      <div className="text-right">
        <div className="flex items-center justify-end space-x-1 text-sm font-medium">
          <span>{formatAmount(Number(order.amount_fiat || 0), order.currency_fiat)}</span>
        </div>
        <div className="mt-1">
          <Badge variant={statusVariant(order.status)} className={`text-xs ${statusColorClasses(order.status)}`}>
            {order.status}
          </Badge>
        </div>
      </div>
    </Button>
  );
}
