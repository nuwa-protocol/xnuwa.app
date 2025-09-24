import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableRow } from '@/shared/components/ui/table';
import type { Order } from '../hooks/use-orders';

function CopyableCell({ value }: { value: string | number | boolean | null }) {
  const [copied, setCopied] = useState(false);
  const text = value === null ? 'null' : String(value);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (e) {
      console.error('copy failed', e);
    }
  };
  return (
    <TableCell
      className="cursor-pointer hover:bg-muted/50 transition-colors font-mono text-xs break-all"
      onClick={onCopy}
      title="Click to copy"
    >
      {copied ? <span className="text-green-600">Copied!</span> : text}
    </TableCell>
  );
}

function Row({ label, value }: { label: string; value: string | number | boolean | null }) {
  return (
    <TableRow>
      <TableCell className="font-medium text-sm">{label}</TableCell>
      <CopyableCell value={value} />
    </TableRow>
  );
}

function formatAmount(amount: number | undefined, currency: string | undefined) {
  if (amount === undefined || currency === undefined) return null;
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 4 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function flattenObject(obj: unknown, prefix = ''): Array<{ key: string; value: string | number | boolean | null }> {
  const rows: Array<{ key: string; value: string | number | boolean | null }> = [];
  if (!obj || typeof obj !== 'object') return rows;
  const entries = Object.entries(obj as Record<string, unknown>);
  for (const [k, v] of entries) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v === null) {
      rows.push({ key: path, value: null });
    } else if (Array.isArray(v)) {
      // Represent arrays as comma-separated simple values or JSON if nested
      const simple = v.every((x) => ['string', 'number', 'boolean'].includes(typeof x) || x === null);
      rows.push({ key: path, value: simple ? (v as any[]).join(', ') : JSON.stringify(v) });
    } else if (typeof v === 'object') {
      rows.push(...flattenObject(v, path));
    } else {
      rows.push({ key: path, value: v as string | number | boolean });
    }
  }
  return rows;
}

export function DepositTransactionDetailsModal({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  if (!order) return null;

  const createdAt = order.created_at
    ? `${new Date(order.created_at).getTime()} (${new Date(order.created_at).toLocaleString()})`
    : null;
  const updatedAt = order.updated_at
    ? `${new Date(order.updated_at).getTime()} (${new Date(order.updated_at).toLocaleString()})`
    : null;
  const fiatFormatted = formatAmount(order.amount_fiat, order.currency_fiat);
  const ipnRows = useMemo(() => flattenObject(order.ipn_payload ?? undefined), [order.ipn_payload]);

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Table>
            <TableBody>
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">Identifiers</TableCell>
              </TableRow>
              <Row label="Order ID" value={order.order_id || null} />
              <Row label="NowPayments Payment ID" value={order.nowpayments_payment_id} />

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">Status</TableCell>
              </TableRow>
              <Row label="Status" value={order.status} />
              <Row label="Pay Currency" value={order.pay_currency || null} />
              <Row label="Payer DID" value={order.payer_did || null} />

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">Amounts</TableCell>
              </TableRow>
              <Row label="Fiat Amount" value={fiatFormatted || order.amount_fiat} />
              <Row label="Fiat Currency" value={order.currency_fiat} />

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">Transfers</TableCell>
              </TableRow>
              <Row label="Transfer Tx" value={order.transfer_tx || null} />

              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">Timestamps</TableCell>
              </TableRow>
              <Row label="Created At" value={createdAt} />
              <Row label="Updated At" value={updatedAt} />

              {ipnRows.length > 0 && (
                <>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={2} className="font-semibold text-sm">IPN Payload</TableCell>
                  </TableRow>
                  {ipnRows.map(({ key, value }) => (
                    <Row key={key} label={key} value={value} />
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
