import { formatAmount } from '@nuwa-ai/payment-kit';
import type { PaymentTransaction } from '@/features/wallet/types';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

const getAssetDecimals = (details: PaymentTransaction['details'] | null) => {
  const dec = details?.requirement?.extra?.assetDecimals;
  return Number.isInteger(dec) ? Number(dec) : 6;
};

const formatCost = (details: PaymentTransaction['details']) => {
  if (!details) return undefined;
  const raw = details.requirement?.maxAmountRequired;
  if (raw === undefined || raw === null) return undefined;
  const amount = BigInt(String(raw));
  const decimals = getAssetDecimals(details);
  return `$${formatAmount(amount, decimals)}`;
};

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

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

type SettlementStatus = 'settled' | 'pending';

const getSettlementStatus = (
  details: PaymentTransaction['details'] | null,
): SettlementStatus => {
  if (details?.response?.success) return 'settled';
  return 'pending';
};

const settlementBadgeStyles: Record<SettlementStatus, string> = {
  settled: 'text-green-600 border-green-200 bg-green-50',
  pending: 'text-amber-600 border-amber-200 bg-amber-50',
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
  const costText = transaction.details
    ? formatCost(transaction.details) || '$0.00'
    : null;
  const settlementStatus = getSettlementStatus(transaction.details);
  const settlementBadgeClass = settlementBadgeStyles[settlementStatus];

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
        ) : (
          <div className="font-medium flex items-center gap-2 justify-end">
            <span>{costText}</span>
            <Badge
              variant="outline"
              className={`text-[10px] h-5 px-1.5 ${settlementBadgeClass}`}
            >
              {settlementStatus === 'settled' ? 'Settled' : 'Pending'}
            </Badge>
          </div>
        )}
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <span>{formatDate(transaction.info.timestamp || 0)}</span>
        </div>
      </div>
    </Button>
  );
}
