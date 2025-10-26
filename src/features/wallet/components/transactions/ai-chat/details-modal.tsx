import { formatAmount } from '@nuwa-ai/payment-kit';
import { useState } from 'react';
import type { PaymentTransaction } from '@/features/wallet/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/shared/components/ui/table';

function isLegacy(details: any): details is { payment?: { cost?: bigint; costUsd?: bigint; nonce?: bigint; serviceTxRef?: string } } {
  return !!details && typeof details === 'object' && 'payment' in details;
}

const getAssetDecimals = (details: any): number => {
  const dec = details?.requirement?.extra?.assetDecimals;
  return Number.isInteger(dec) ? Number(dec) : 6;
};

const formatCost = (details: PaymentTransaction['details']) => {
  if (!details) return null;
  if (isLegacy(details)) {
    const cost = details.payment?.costUsd;
    if (cost === undefined || cost === null) return null;
    const asBig = typeof cost === 'bigint' ? cost : BigInt(String(cost));
    return `$${formatAmount(asBig, 12)}`;
  }
  const raw = details?.requirement?.maxAmountRequired;
  if (raw === undefined || raw === null) return null;
  const amount = BigInt(String(raw));
  const decimals = getAssetDecimals(details);
  return `$${formatAmount(amount, decimals)}`;
};

const formatDate = (timestamp: number) => {
  if (!timestamp) return 'undefined';
  const localString = new Date(timestamp).toLocaleString();
  return `${timestamp} (${localString})`;
};

const formatDuration = (durationMs: number | undefined) => {
  if (!durationMs) return null;
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(2)}s`;
};

interface CopyableCellProps {
  value: string | number | boolean | null;
  isNested?: boolean;
}

function CopyableCell({ value, isNested = false }: CopyableCellProps) {
  const [copied, setCopied] = useState(false);

  const displayValue = value === null ? 'null' : String(value);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <TableCell
      className={`cursor-pointer hover:bg-muted/50 transition-colors font-mono text-xs break-all ${value === null ? 'text-muted-foreground italic' : ''
        } ${isNested ? 'pl-8' : ''}`}
      onClick={handleCopy}
      title="Click to copy"
    >
      {copied ? <span className="text-green-600">Copied!</span> : displayValue}
    </TableCell>
  );
}

interface TableRowItemProps {
  label: string;
  value: string | number | boolean | null;
  isNested?: boolean;
}

function TableRowItem({ label, value, isNested = false }: TableRowItemProps) {
  return (
    <TableRow>
      <TableCell className={`font-medium text-sm ${isNested ? 'pl-8' : ''}`}>
        {label}
      </TableCell>
      <CopyableCell value={value} isNested={isNested} />
    </TableRow>
  );
}

interface TransactionDetailsModalProps {
  transaction: PaymentTransaction | null;
  onClose: () => void;
}

export function AITransactionDetailsModal({
  transaction,
  onClose,
}: TransactionDetailsModalProps) {
  if (!transaction) return null;

  const details = transaction.details;

  return (
    <Dialog open={!!transaction} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Table>
            <TableBody>
              {/* Basic Information */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">
                  Basic Information
                </TableCell>
              </TableRow>
              <TableRowItem
                label="Context ID"
                value={transaction.info.ctxId}
                isNested
              />
              <TableRowItem
                label="Payment Type"
                value={transaction.info.type}
                isNested
              />
              <TableRowItem
                label="Chat Timestamp"
                value={formatDate(transaction.info.timestamp)}
                isNested
              />
              <TableRowItem
                label="Message"
                value={transaction.info.message || null}
                isNested
              />

              {/* Transaction Details */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">
                  Transaction Details
                </TableCell>
              </TableRow>
              {details && isLegacy(details) ? (
                <>
                  <TableRowItem label="Client Transaction Reference" value={details.clientTxRef || null} isNested />
                  <TableRowItem label="Transaction Timestamp" value={details ? formatDate(details.timestamp) : null} isNested />
                  <TableRowItem label="Protocol" value={details.protocol || null} isNested />
                  <TableRowItem label="Method" value={details.method || null} isNested />
                  <TableRowItem label="URL or Target" value={details.urlOrTarget || null} isNested />
                  <TableRowItem label="Operation" value={details.operation || null} isNested />
                  <TableRowItem label="Request Body Hash" value={details.requestBodyHash || null} isNested />
                  <TableRowItem label="Stream" value={details.stream || null} isNested />
                  <TableRowItem label="Channel ID" value={details.channelId || null} isNested />
                  <TableRowItem label="VM ID Fragment" value={details.vmIdFragment || null} isNested />
                  <TableRowItem label="Asset ID" value={details.assetId || null} isNested />
                  <TableRowItem label="Status Code" value={details.statusCode || null} isNested />
                  <TableRowItem label="Duration (ms)" value={formatDuration(details?.durationMs)} isNested />
                  <TableRowItem label="Status" value={details?.status || null} isNested />
                  <TableRowItem label="Error Code" value={details?.errorCode || null} isNested />
                  <TableRowItem label="Error Message" value={details?.errorMessage || null} isNested />
                </>
              ) : (
                <>
                  <TableRowItem label="Client Transaction Reference" value={transaction.info.ctxId || null} isNested />
                  <TableRowItem label="Network" value={details?.requirement?.network || null} isNested />
                  <TableRowItem label="Resource" value={details?.requirement?.resource || null} isNested />
                  <TableRowItem label="Mime Type" value={details?.requirement?.mimeType || null} isNested />
                  <TableRowItem label="Asset" value={details?.requirement?.asset || null} isNested />
                  <TableRowItem label="Pay To" value={details?.requirement?.payTo || null} isNested />
                  <TableRowItem label="Max Amount Required" value={String(details?.requirement?.maxAmountRequired ?? '') || null} isNested />
                  <TableRowItem label="Scheme" value={details?.requirement?.scheme || null} isNested />
                  <TableRowItem label="Description" value={(details?.requirement as any)?.description ?? null} isNested />
                </>
              )}

              {/* Payment Information */}
              <TableRow className="bg-muted/30">
                <TableCell colSpan={2} className="font-semibold text-sm">
                  Payment Information
                </TableCell>
              </TableRow>
              {details && isLegacy(details) ? (
                <>
                  <TableRowItem label="Cost (Native Units)" value={details.payment?.cost?.toString() || null} isNested />
                  <TableRowItem label="Cost (USD)" value={formatCost(details)} isNested />
                  <TableRowItem label="Nonce" value={details.payment?.nonce?.toString() || null} isNested />
                  <TableRowItem label="Service Transaction Reference" value={details.payment?.serviceTxRef || null} isNested />
                </>
              ) : (
                <>
                  <TableRowItem label="Amount" value={formatCost(details)} isNested />
                  <TableRowItem label="Asset Decimals" value={String(getAssetDecimals(details))} isNested />
                  <TableRowItem label="Service Transaction Reference" value={(details?.response as any)?.transaction ?? null} isNested />
                </>
              )}

              {/* Headers Summary (legacy only) */}
              {details && isLegacy(details) && details.headersSummary && (
                <>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={2} className="font-semibold text-sm">
                      Headers Summary
                    </TableCell>
                  </TableRow>
                  {Object.entries(details.headersSummary).map(([key, value]) => (
                    <TableRowItem key={key} label={key} value={value} isNested />
                  ))}
                </>
              )}

              {/* Metadata (legacy only) */}
              {details && isLegacy(details) && details.meta && (
                <>
                  <TableRow className="bg-muted/30">
                    <TableCell colSpan={2} className="font-semibold text-sm">
                      Metadata
                    </TableCell>
                  </TableRow>
                  {Object.entries(details.meta).map(([key, value]) => (
                    <TableRowItem
                      key={key}
                      label={key}
                      value={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      isNested
                    />
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
