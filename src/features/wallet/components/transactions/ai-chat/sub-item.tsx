import { formatAmount } from '@nuwa-ai/payment-kit';
import type { PaymentTransaction } from '@/features/wallet/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

// Helpers to support both legacy and new X402 record shapes
function isLegacy(details: any): details is { payment?: { costUsd?: bigint }; status?: string } {
  return !!details && typeof details === 'object' && 'payment' in details;
}

const getAssetDecimals = (details: any): number => {
  const dec = details?.requirement?.extra?.assetDecimals;
  return Number.isInteger(dec) ? Number(dec) : 6; // default USDC decimals
};

const formatCost = (details: PaymentTransaction['details']) => {
  if (!details) return undefined;
  if (isLegacy(details)) {
    const cost = details.payment?.costUsd;
    if (!cost && cost !== 0n) return undefined;
    const asBig = typeof cost === 'bigint' ? cost : BigInt(String(cost));
    return `$${formatAmount(asBig, 12)}`;
  }
  // New record: display requirement.maxAmountRequired in asset units
  const raw = details?.requirement?.maxAmountRequired;
  if (raw === undefined || raw === null) return undefined;
  const amount = BigInt(String(raw));
  const decimals = getAssetDecimals(details);
  return `$${formatAmount(amount, decimals)}`;
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
        ) : isLegacy(transaction.details) ? (
          transaction.details.status === 'pending' ? (
            <p className="font-medium">Pending...</p>
          ) : (
            <p className="font-medium">{formatCost(transaction.details) || '$0.00'}</p>
          )
        ) : (
          // For new x402 records (no legacy status), always show the amount from requirement
          // so users see the real value even if the response hasn't been captured yet.
          <p className="font-medium">{formatCost(transaction.details) || '$0.00'}</p>
        )}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{formatDate(transaction.info.timestamp || 0)}</span>
        </div>
      </div>
    </Button>
  );
}
