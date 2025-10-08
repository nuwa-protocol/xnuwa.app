import { formatAmount } from '@nuwa-ai/payment-kit';
import type { PaymentTransaction } from '@/features/wallet/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

const formatCost = (cost: bigint | undefined) => {
  if (!cost) return undefined;
  if (typeof cost === 'bigint') return `$${formatAmount(cost, 12)}`;
  if (cost !== undefined && cost !== null) {
    return `$${formatAmount(BigInt(String(cost)), 12)}`;
  }
  return undefined;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// Build the primary label text without the type prefix; we render the type as a badge next to the time.
const formatTransactionLabel = (transaction: PaymentTransaction) => {
  if (transaction.info.type === 'generate-title') {
    return 'Chat Title Generation';
  }
  const snippet = transaction.info.message?.slice(0, 15);
  const hasMore =
    !!transaction.info.message && transaction.info.message.length > 15;
  if (snippet) return `${snippet}${hasMore ? '...' : ''}`;
  return 'Untitled';
};

// Map the transaction type to a human readable badge label.
const getTransactionTypeLabel = (transaction: PaymentTransaction) => {
  switch (transaction.info.type) {
    case 'chat-message':
      return 'Chat Message';
    case 'ai-request':
      return 'AI Request';
    case 'tool-call':
      return 'Tool Call';
    case 'generate-title':
      return 'Title Generation';
    default:
      return String(transaction.info.type);
  }
};

interface TransactionItemProps {
  transaction: PaymentTransaction;
  onSelect: (transaction: PaymentTransaction) => void;
  index: number;
}

export function AITransactionSubItem({
  transaction,
  onSelect,
  index,
}: TransactionItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-between p-2 h-auto hover:bg-muted/30 rounded-sm"
      onClick={() => onSelect(transaction)}
    >
      <div className="flex items-center gap-3 text-left">
        <span className="text-xs text-muted-foreground font-mono">
          #{index + 1}
        </span>
        <div>
          <p className="text-sm font-medium">
            {formatTransactionLabel(transaction)}
          </p>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
            {getTransactionTypeLabel(transaction)}
          </Badge>
        </div>
      </div>
      <div className="text-right">
        {!transaction.details ? (
          <p className="font-medium">No transaction record</p>
        ) : transaction.details.status === 'pending' ? (
          <p className="font-medium">Pending...</p>
        ) : (
          <p className="font-medium">
            {formatCost(transaction.details?.payment?.costUsd) || '$0.00'}
          </p>
        )}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{formatDate(transaction.info.timestamp || 0)}</span>
        </div>
      </div>
    </Button>
  );
}
