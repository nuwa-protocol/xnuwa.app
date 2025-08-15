import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { useTransactions } from '@/shared/hooks/useTransactions';
import { formatAmount } from '@nuwa-ai/payment-kit';

function TransactionRow({
  operation,
  status,
  statusCode,
  cost,
  costUsd,
  paidAt,
  stream,
}: {
  operation: string;
  status: string;
  statusCode?: number;
  cost?: string;
  costUsd?: string;
  paidAt?: string;
  stream?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{operation}</span>
          {stream && <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">stream</span>}
        </div>
        <p className="text-sm text-muted-foreground">{paidAt ? new Date(paidAt).toLocaleString() : ''}</p>
      </div>
      <div className={`flex flex-col items-end`}>
        <div className="font-semibold">{status}{statusCode ? ` (${statusCode})` : ''}</div>
        {cost && (
          <div className="text-muted-foreground text-xs">{costUsd ? `${cost} (${costUsd} USD)` : cost}</div>
        )}
      </div>
    </div>
  );
}

export function TransactionHistory() {
  const { items, loading, error, reload } = useTransactions(50);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Transactions</CardTitle>
        <button onClick={reload} className="text-sm text-muted-foreground underline">Refresh</button>
      </CardHeader>
      <CardContent>
        {loading ? <p className="text-muted-foreground text-sm">Loading...</p> : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No payment transactions</p>
        ) : (
          <div className="space-y-0">
            {items.map((tx) => (
              <TransactionRow
                key={tx.clientTxRef}
                operation={tx.operation || tx.urlOrTarget}
                status={tx.status}
                statusCode={tx.statusCode}
                cost={tx.payment?.cost?.toString()}
                costUsd={(() => {
                  const v = tx.payment?.costUsd as unknown;
                  if (typeof v === 'bigint') return `$${formatAmount(v, 12)}`;
                  if (v !== undefined && v !== null) {
                    return `$${formatAmount(BigInt(String(v)), 12)}`;
                  }
                  return undefined;
                })()}
                paidAt={tx.payment?.paidAt}
                stream={tx.stream}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
